---
name: performance
description: "TypeScript performance work: data-oriented design, V8-friendly layout, cache removal. Load before optimizing, profiling, or reviewing slow code or a hot path."
---

# Performance

Performance is a design property, not a layer added on top. We make code fast by doing less work and laying data out for the machine, and we prove every change with numbers.

## Steps

1. **Go red.** Reproduce the slowness as a benchmark or profile with a baseline number before touching code. Use the repo's existing bench setup (Vitest `bench`, `mitata`, `tinybench`); profile with `node --cpu-prof` / `--heap-prof` or the DevTools Performance panel. Done when a repeatable measurement shows the problem.
2. **Locate the hot path.** Read the profile, not the code, to decide where time goes. Done when you can name the function or request chain that owns the cost and its share of the total.
3. **Remove work.** Work through the [ladder](#the-ladder) top to bottom; stop at the first rung that closes the gap.
4. **Go green.** Re-run the same measurement on the same machine, several runs, and report before/after with variance. Correctness tests stay green. A change that does not move the number is reverted, however clever.

## The ladder

Each rung is cheaper to get wrong than the next. Climb down only when the rung above is exhausted.

### 1. Algorithm and I/O shape

In TypeScript services and apps the hot path is usually I/O, not CPU.

- Serial `await`s that could run concurrently → `Promise.all` or a batch.
- N+1 queries and request waterfalls → one query or one request that fetches the set.
- Over-fetching → select and transfer only what the caller reads.
- Quadratic scans (`array.find` / `includes` inside a loop) → build an index once, then look up.
- Parsing and validation repeated per item → parse once at the boundary and pass refined values in.

### 2. Data layout (data-oriented design)

The data is the problem, not the domain model. Design around how data is read and written in bulk: find the record you have the most of in memory and make it smaller, so each unit of work touches fewer bytes and the GC traces fewer objects.

Start from the access pattern. For the hot loop, list which fields it reads, which it writes, how many items, and how often. Then reshape:

- **Structure of arrays.** When a loop reads one or two fields across many items, store each field as its own column, keyed by a shared index. Numeric columns are `TypedArray`s (`Float64Array`, `Int32Array`, `Uint32Array`, `Uint8Array`): contiguous, unboxed, and opaque to the GC. V8 stopped unboxing double fields inside objects when it adopted pointer compression, and points number-heavy code at `Float64Array` instead.
- **Hot/cold split.** Fields the hot loop touches live in dense columns; fields read rarely live in a side table under the same index.
- **Indices over references.** Entities refer to each other by integer index into a column set, not by object reference. The object graph disappears: nothing for the GC to trace, and the whole set serializes as a handful of buffers.
- **Handles with generations.** When freed slots are reused (via a free list), a stale index silently points at a new entity. Pack a per-slot generation counter into the upper bits of the index; a lookup compares the handle's generation with the slot's and rejects stale handles. When a slot's counter would overflow, retire the slot.
- **Tags in the index.** Alternatively, the upper bits carry a small kind tag, so one read answers both "which" and "what kind" without a lookup.
- **Encodings over polymorphism.** Replace a class hierarchy, or one array of mixed object shapes, with a `Uint8Array` tag column plus one table per kind, each processed in its own loop. Membership in a table replaces the per-item `if` or `switch` (existence-based processing).
- **Booleans out of band.** A flag true for few items becomes existence: the flagged items' indices in their own list. A dense flag becomes a bitset in a `Uint32Array`, one bit per item. A `boolean[]` spends a full tagged slot per element (4 bytes with pointer compression, 8 without), 32–64× the bitset.
- **Dense keys in arrays, sparse data in maps.** Dense integer keys (or keys you can make dense) index straight into an array instead of a `Map`. Data that only a few items have belongs in a `Map` keyed by index, not in a mostly-empty column.
- **Preallocated scratch over growing lists.** JS has no programmer-controlled stack allocation (TurboFan's escape analysis removes some short-lived local objects, but not on demand). The equivalent of a stack list with inline capacity is a fixed-capacity `TypedArray` plus a length counter, allocated once outside the hot loop, reset with `len = 0`, and replaced by a buffer of double the size only on overflow.

```ts
// Bitset
const bits = new Uint32Array((n + 31) >>> 5);
const set = (i: number) => { bits[i >>> 5] |= 1 << (i & 31); };
const has = (i: number) => (bits[i >>> 5] & (1 << (i & 31))) !== 0;

// Handle: 20 index bits (~1M slots) + 12 generation bits
const INDEX_BITS = 20;
const INDEX_MASK = (1 << INDEX_BITS) - 1;
const makeHandle = (index: number, gen: number) => ((gen << INDEX_BITS) | index) >>> 0;
const handleIndex = (h: number) => h & INDEX_MASK;
const handleGen = (h: number) => h >>> INDEX_BITS;
```

V8 gotchas for bits:

- Bitwise operators return signed 32-bit integers: `1 << 31` is negative. Test bits with `!== 0`, never `> 0`, and use `>>> 0` to read a result as unsigned.
- Plain-array elements and object fields hold integers unboxed only up to 2^30 − 1 in browsers (pointer compression) or 2^31 − 1 in default Node builds; a packed `Uint32` with the top bit set exceeds both and becomes a heap number. Store packed values in `Uint32Array` / `Int32Array`, not plain arrays.

Branded index and handle types (`type UserIdx = number & Brand<"UserIdx">`) keep this layout type-safe at zero runtime cost, and stop an index into one table from being used against another.

### 3. Engine-friendly code

Apply only on a measured hot path; V8 changes, so each claim here is verified by the benchmark, not trusted.

- **Monomorphic shapes.** Create objects of one kind with the same fields, in the same order, all initialized at construction. Leave out `delete` and late-added properties; prefer `undefined` in a declared field.
- **Stable element kinds.** Keep arrays packed and single-typed; a hole, a double, or an object downgrades the whole array, permanently. A single `-0`, `NaN`, or `Infinity` turns an integer array into a double array; normalize them on the way in. Never read past `length`.
- **Allocation-free loops.** In the hot loop, replace `.map().filter().reduce()` chains (each allocates an intermediate array), spreads, and per-iteration closures with one pass writing into a preallocated buffer. `for`, `for-of`, and `forEach` are on par; the win is fewer allocations, not the loop syntax.

### 4. Caching (last resort)

Caching is cope for a slow design. Before adding a cache, redesign so the work is fast or unnecessary; when touching a hot path, treat existing in-process caches and memoization as suspects and delete the ones a redesign makes redundant.

A cache that survives states, in a comment beside it: its key, its invalidation trigger, its size bound, and the measured win. Caches across a network boundary (HTTP, CDN, remote API results) follow the same rule but are often the right design, because the slow part is not ours to redesign.

In UI code, `useMemo`, `memo`, and selectors are caches too: count renders and fix why they happen before memoizing. Where React Compiler is enabled it memoizes automatically; leave manual memoization out.

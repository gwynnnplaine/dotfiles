# Vocabulary

Use these exact terms in explanations, reviews, and design notes when the concept applies. Topic files may define only topic-local terms near their rules.

## Failure language

**Expected Failure** — A normal-operation failure callers may need to handle: domain rejection, parse failure, authorization denial, dependency failure, I/O failure, persistence failure, or cancellation outcome. Expected failures are represented as typed values.

**Unrecoverable Defect** — A programmer error or catastrophic condition where continuing is invalid: impossible branch, violated internal invariant, startup misconfiguration, or temporary unimplemented path. Defects may throw, panic, or crash.

**Custom Error** — A typed, tagged error value for an Expected Failure. It has a stable `_tag`, useful message, structured safe context, and may retain an `unknown` cause.

**Precise Error Union** — The explicit, narrow set of Expected Failures a function returns, discriminated so callers can handle cases semantically.

**Not Found Failure** — The typed Expected Failure for a *required* get/find/read that finds nothing. Model it as a variant in the operation's error union, not a silent `null`. Optional lookup semantics should be explicit in the operation's name/contract instead.

**Unknown Catch Cause** — A caught thrown value treated as `unknown` until classified; JavaScript can throw anything. Adapters catching exception-style dependencies classify `unknown`, preserve useful causes, and translate into the local typed failure contract.

## Boundary and parsing language

**Unknown Boundary Input** — Untrusted or less-structured input represented as `unknown` or a boundary DTO until a parser refines it: HTTP bodies, JSON, queue payloads, storage rows, env vars, RPC payloads, third-party responses.

**Parse, Don't Validate** — Convert unknown or less-structured input into a refined/domain value at the earliest seam, then pass that value inward. Core/application code never receives `unknown`, `any`, `Record<string, unknown>`, or raw DTOs.

**Schema Parser** — A boundary parser built with the repo's runtime schema library that turns unknown input into refined/domain types and typed parse failures.

**Persistence Boundary Parser** — A parser at the storage seam that treats database rows and storage DTOs as less-structured input and reconstructs domain values before core logic sees them.

**Serialized Data Trust Cast** — A direct cast from decoded serialized data to a domain type, e.g. `JSON.parse(text) as CreateUserInput`. Banned: a parser or smart constructor must establish the invariant, and the refined value must be the one used.

**Smart Constructor** — The single sanctioned way to build a refined value. Naming: `parseX` for untrusted/less-structured input, `makeX`/`createX` for construction from already-typed pieces, `isX` for predicates/type-guards. Avoid `validateX` when the function actually returns a refined value.

**Mutating Parser** — A parser for a mutating command/request body. It rejects unknown fields (strict) unless the external contract is explicitly extensible, so silent extra data can't slip through a write path.

**Protocol Projection** — A named conversion from a domain/service value into an HTTP/RPC/queue/public API DTO, owned by that protocol's External Adapter Module (`toPublicJson`).

**Persistence Projection** — A named conversion between domain/service values and storage rows/records, owned by the persistence External Adapter Module.

## Domain language

**Domain Module** — A TypeScript module centered on one primary domain type or tightly related type family. It exposes parsers, smart constructors, combinators, predicates, transitions, projections, arbitraries, and formatting helpers for that concept. It is pure domain code.

**Branded Type** — A nominal TypeScript type that distinguishes a parsed domain value from its primitive representation. It is created through a parser or smart constructor.

**Value Class** — A cohesive, immutable class representation of a domain value, created only through parsers or smart constructors.

**State Machine** — A tagged-union or value-class lifecycle model where each state carries only fields legal for that state and exposes legal transitions.

**Boolean Blindness** — Loss of meaning from raw booleans used for modes, policies, or lifecycle distinctions. Reach for a discriminated union or named type instead.

**Correct by Construction** — Design that makes invalid states impossible or difficult to construct rather than relying on caller discipline.

## Module language

**Module** — Anything with an interface and implementation: function, class, file, package, service slice, adapter, or stateful object. Deliberately scale-agnostic.

**Interface** — Everything callers must know to use a module correctly: type signatures, invariants, ordering constraints, error modes, configuration, performance, and side effects. Wider than a type signature.

**Implementation** — What sits behind the interface.

**Seam** — A place where behavior can vary without editing the caller at that point. The seam is where the interface lives.

**Depth** — Caller leverage per unit of interface burden. Deep modules hide substantial behavior behind a small interface.

**Deep Module** — A module with high leverage: a cohesive, low-burden interface hiding substantial behavior, invariants, and incidental steps.

**Leverage** — What callers get from depth: more capability per unit of interface they learn.

**Locality** — What maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place.

**Service Module** — A dependency-bearing module in the Imperative Shell that coordinates a cohesive use case, workflow, or service capability. It composes Domain Modules and interfaces implemented by External Adapter Modules through explicit dependencies, sequences effects, owns use-case policy, classifies dependency failures, and returns typed outcomes. It receives parsed service/domain values, not raw framework, protocol, persistence, or third-party shapes. Pure domain behavior remains in Domain Modules even when other literature might call it a domain service.

**Adapter** — A concrete implementation that satisfies an interface at a seam, usually translating to a framework, platform, database, external service, or test substitute. Describes role, not substance.

**External Adapter Module** — A specialized Adapter at an external boundary. It includes inbound adapters such as HTTP/RPC/queue handlers and outbound adapters such as persistence, SDK, platform, and third-party integrations. Service Modules depend on narrow behavior-shaped interfaces; External Adapter Modules implement those interfaces at composition seams.

**Accidental Interface** — A leaky or wide interface that forces callers to know unrelated methods, raw DTOs, nullable state bags, ordering constraints, hidden side effects, or implementation details.

**Narrow Dependency Interface** — A dependency type stating only the behavior a module actually uses, named for the consuming capability (e.g. `UsersForPasswordReset`). Wider concrete adapters satisfy it structurally.

**Adapter Reuse Audit** — The search before creating a new adapter: reuse an existing one through a narrow dependency type if it already provides the behavior; extend it if the new operation is cohesive and changes for the same reason; create new only when reuse/extension would force bad coupling. One adapter is a hypothetical seam; two adapters make it real.

**Functional Core** — The pure, entrypoint-agnostic center: domain logic, parsers, transitions, combinators, and decisions. It avoids I/O, hidden dependencies, ambient time/randomness, framework concerns, and thrown expected failures.

**Imperative Shell** — The outer layer that parses inputs, sequences effects, calls the functional core, classifies dependency failures, and handles I/O, persistence, HTTP, queues, telemetry, time, and randomness.

## Runtime and observability language

**Structured Tracing** — End-to-end correlated telemetry across requests, jobs, modules, adapters, and external calls using safe fields such as domain IDs, operation names, dependency names, state tags, retry paths, and typed error tags.

**Safe Error Summary** — A telemetry or panic summary built from stable tags, kinds, operation names, type names, or explicitly safe fields. It does not serialize arbitrary values.

**Redacted Value** — A wrapper for sensitive values that prevents accidental logging, inspection, and JSON serialization. Use it for tokens, API keys, passwords, raw credentials, and secrets.

**Caller-Owned Cancellation Lifetime** — A cancellation design where lower-level modules accept and propagate the caller's `AbortSignal` instead of inventing hidden lifetimes.

**Detached Work** — Intentional async work that can outlive the current call path and is handed to a runtime/project mechanism that owns lifetime, cancellation, rejection handling, and observability.

## Adoption language

**Adoption Rule** — In established codebases, prefer these standards for new/changed paths while respecting compatible local architecture. Improve the local design without forcing broad migrations unless explicitly requested.

**Project Convention Audit** — The required inspection before adding libraries or patterns: errors, schemas, testing, dependency injection, observability, adapters, service modules, and module layout.

**Compatibility Glue** — Small temporary adapter/config/integration code used only because current tooling or surrounding architecture cannot express the preferred pattern yet. Keep it isolated and removable.

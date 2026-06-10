# Flyweight

**Book reference:** *Dive Into Design Patterns*, pp. 222–235.

## Intent
Flyweight is a structural design pattern that lets you fit more objects into available RAM by sharing common parts of state between multiple objects instead of keeping all data in each object.

## Problem
The book frames Flyweight around memory pressure from massive numbers of similar objects that duplicate the same immutable data.

## Solution
Split state into **intrinsic** shared state and **extrinsic** unique state. Store intrinsic state in flyweight objects and keep extrinsic context outside them.

## Structure
- **Flyweight** containing shared intrinsic state
- **Flyweight Factory** reusing flyweights
- **Context** storing unique extrinsic state and referencing a flyweight

## Applicability
Use it when:
- huge numbers of objects cause memory issues
- much of each object's state can be shared and treated as immutable

## Pros and cons
**Pros**
- Greatly reduces memory use when sharing is high
- Centralizes reusable immutable state

**Cons**
- Increases code complexity by splitting state
- May trade memory wins for runtime coordination overhead

## Related patterns
- [Singleton](../creational/singleton.md) manages one shared object; Flyweight manages many shared objects.
- [Composite](composite.md) often uses flyweights for leaf data.
- [State](../behavioral/state.md) and [Strategy](../behavioral/strategy.md) objects can sometimes be shared as flyweights.

## TypeScript sketch
```ts
type GlyphKey = `${string}:${number}:${string}`;

type Glyph = Readonly<{
  char: string;
  size: number;
  font: string;
}>;

class GlyphFactory {
  private cache = new Map<GlyphKey, Glyph>();

  get(char: string, size: number, font: string): Glyph {
    const key: GlyphKey = `${char}:${size}:${font}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const glyph = Object.freeze({ char, size, font });
    this.cache.set(key, glyph);
    return glyph;
  }
}
```

## PR review cues
- Good fit only if the PR solves real memory duplication with shared intrinsic state.
- Red flag if Flyweight is introduced without evidence of scale or memory pressure.

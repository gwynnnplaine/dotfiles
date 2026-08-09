# Prototype

**Book reference:** *Dive Into Design Patterns*, pp. 125–138.

## Intent
Prototype is a creational design pattern that lets you copy existing objects without making your code dependent on their concrete classes.

## Problem
The book highlights that copying from the outside requires concrete class knowledge and may not work when fields are private or when callers only know an interface.

## Solution
Let objects clone themselves. A common prototype interface exposes a cloning operation; each concrete class knows how to copy its own state correctly.

## Structure
- **Prototype** interface with `clone`
- **Concrete Prototypes** implementing copy logic
- Optional **prototype registry** for preconfigured reusable instances

## Applicability
Use it when:
- callers need copies but should not depend on concrete classes
- object setup is expensive or highly configured
- cloning a prepared object is easier than rebuilding it

## Pros and cons
**Pros**
- Avoids direct dependence on concrete classes during copying
- Can speed up creation of configured objects
- Supports prototype registries for common presets

**Cons**
- Cloning complex graphs can be tricky
- Deep vs shallow copy rules must be explicit

## Related patterns
- [Factory Method](factory-method.md) and [Abstract Factory](abstract-factory.md) may evolve toward Prototype when cloning is more flexible.
- [Memento](../behavioral/memento.md) also captures state, but for restoration rather than object creation.

## TypeScript sketch
```ts
interface Prototype<T> {
  clone(): T;
}

class ShapeStyle implements Prototype<ShapeStyle> {
  constructor(
    readonly color: string,
    readonly borderWidth: number,
  ) {}

  clone() {
    return new ShapeStyle(this.color, this.borderWidth);
  }
}

const base = new ShapeStyle('red', 2);
const copy = base.clone();
```

## PR review cues
- Good fit if the PR truly benefits from cloning configured instances.
- Red flag if “prototype” is used as a label but objects are still rebuilt manually.

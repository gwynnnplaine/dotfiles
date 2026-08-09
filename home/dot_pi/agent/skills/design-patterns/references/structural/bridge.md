# Bridge

**Book reference:** *Dive Into Design Patterns*, pp. 165–179.

## Intent
Bridge is a structural design pattern that lets you split a large class or a set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently.

## Problem
The book's core problem is **combinatorial explosion** when one hierarchy varies along two independent dimensions, such as shape and color.

## Solution
Replace inheritance across both dimensions with composition. Put one dimension into the abstraction hierarchy and the other into the implementation hierarchy. The abstraction delegates work to the implementation object.

## Structure
- **Abstraction** holding a reference to an implementation
- **Refined Abstractions** extending the abstraction side
- **Implementation** interface
- **Concrete Implementations** for the second dimension

## Applicability
Use it when:
- a class varies in two or more independent dimensions
- extending one hierarchy would cause class explosion
- you want to switch implementations at runtime

## Pros and cons
**Pros**
- Avoids combinatorial subclass growth
- Lets abstraction and implementation evolve independently
- Favors composition over inheritance

**Cons**
- Adds indirection
- Can be overkill if there is only one dimension of variation

## Related patterns
- [Adapter](adapter.md) retrofits mismatches; Bridge is designed deliberately.
- [State](../behavioral/state.md) and [Strategy](../behavioral/strategy.md) can look structurally similar but solve different problems.
- [Abstract Factory](../creational/abstract-factory.md) can help create matching bridge participants.

## TypeScript sketch
```ts
interface Renderer {
  renderButton(label: string): string;
}

class HtmlRenderer implements Renderer {
  renderButton(label: string) { return `<button>${label}</button>`; }
}

class CliRenderer implements Renderer {
  renderButton(label: string) { return `[ ${label} ]`; }
}

abstract class Control {
  constructor(protected renderer: Renderer) {}
}

class ButtonControl extends Control {
  constructor(renderer: Renderer, private label: string) {
    super(renderer);
  }

  render() {
    return this.renderer.renderButton(this.label);
  }
}
```

## PR review cues
- Good fit if the PR splits two independent variation axes cleanly.
- Red flag if a simple strategy or adapter would have solved the real problem.

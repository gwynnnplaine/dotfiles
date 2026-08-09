# Composite

**Book reference:** *Dive Into Design Patterns*, pp. 180–193.

## Intent
Composite is a structural design pattern that lets you compose objects into tree structures and then work with these structures as if they were individual objects.

## Problem
The book motivates Composite with tree-shaped models, such as products and nested boxes. Client code becomes awkward when it must special-case leaves and containers at every level.

## Solution
Give leaves and composites a common component interface. Composite objects store children and forward or aggregate work recursively.

## Structure
- **Component** common interface
- **Leaf** with direct behavior
- **Composite** holding children and delegating recursively
- **Client** using the component abstraction

## Applicability
Use it when:
- your domain is naturally a tree
- callers should treat individual objects and compositions uniformly

## Pros and cons
**Pros**
- Simplifies client code by removing leaf/container branching
- Makes recursive tree operations natural
- Supports Open/Closed extension for new component types

**Cons**
- Hard to restrict child composition precisely in a very strict tree model
- A too-general component interface may feel unnatural for some leaves

## Related patterns
- [Decorator](decorator.md) and Composite share recursive composition but with different intent.
- [Iterator](../behavioral/iterator.md) often traverses composite trees.
- [Visitor](../behavioral/visitor.md) often adds operations over composite structures.
- [Builder](../creational/builder.md) can help assemble complex trees.

## TypeScript sketch
```ts
interface PriceNode {
  total(): number;
}

class Product implements PriceNode {
  constructor(private price: number) {}
  total() { return this.price; }
}

class Box implements PriceNode {
  private children: PriceNode[] = [];

  add(node: PriceNode) {
    this.children.push(node);
  }

  total() {
    return this.children.reduce((sum, child) => sum + child.total(), 0);
  }
}
```

## PR review cues
- Good fit if the PR truly models a part-whole tree with uniform operations.
- Red flag if a plain nested data structure plus functions would be simpler.

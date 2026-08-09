# Abstract Factory

**Book reference:** *Dive Into Design Patterns*, pp. 91–105.

## Intent
Abstract Factory is a creational design pattern that lets you produce families of related objects without specifying their concrete classes.

## Problem
The book's motivating problem is **family consistency**. When products belong together as a variant or theme, callers should not accidentally mix incompatible products from different families.

## Solution
Declare abstract factory methods for each product in the family. Each concrete factory returns a consistent set of concrete products for one variant. Client code uses abstract product interfaces and one abstract factory interface.

## Structure
- **Abstract Products** for each product role
- **Concrete Products** grouped by family/variant
- **Abstract Factory** with one creation method per product role
- **Concrete Factories** producing a coherent family
- **Client** using only abstractions

## Applicability
Use it when:
- a system must work with multiple families of related products
- products of a family must remain compatible
- you want to switch entire families in one place

## Pros and cons
**Pros**
- Guarantees compatibility inside a family
- Isolates concrete classes from client code
- Makes family swaps explicit and centralized

**Cons**
- Harder to add a new product type because every factory interface changes
- Adds several interfaces/classes

## Related patterns
- [Factory Method](factory-method.md) often implements individual factory operations.
- [Builder](builder.md) focuses on assembling one complex product, not a family.
- [Prototype](prototype.md) can also produce product families by cloning preconfigured objects.
- [Singleton](singleton.md) is sometimes used for concrete factories.

## TypeScript sketch
```ts
interface Button { render(): string; }
interface Checkbox { render(): string; }

interface UiFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class LightButton implements Button { render() { return 'light-button'; } }
class LightCheckbox implements Checkbox { render() { return 'light-checkbox'; } }
class DarkButton implements Button { render() { return 'dark-button'; } }
class DarkCheckbox implements Checkbox { render() { return 'dark-checkbox'; } }

class LightFactory implements UiFactory {
  createButton() { return new LightButton(); }
  createCheckbox() { return new LightCheckbox(); }
}

class DarkFactory implements UiFactory {
  createButton() { return new DarkButton(); }
  createCheckbox() { return new DarkCheckbox(); }
}
```

## PR review cues
- Good fit if the PR enforces coherent product families or themes.
- Red flag if only one product varies and an entire abstract-factory lattice was introduced anyway.

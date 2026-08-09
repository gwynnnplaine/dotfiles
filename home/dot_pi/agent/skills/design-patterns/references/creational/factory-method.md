# Factory Method

**Book reference:** *Dive Into Design Patterns*, pp. 75–90.

## Intent
Factory Method is a creational design pattern that provides an interface for creating objects in a superclass, while allowing subclasses to alter the type of objects that get created.

## Problem
The book frames this as creation logic becoming coupled to concrete product classes. Once client code is built around one concrete product, each new product type spreads conditionals and edits through the codebase.

## Solution
Move direct construction into a factory method declared in a creator class. Subclasses override that method to return different concrete products, while the creator's main business logic keeps working through the product interface.

## Structure
- **Product** interface
- **Concrete Products** implementing it
- **Creator** declaring the factory method and using products through the abstraction
- **Concrete Creators** overriding the factory method

## Applicability
Use it when:
- code should work with products via an interface, not a concrete class
- subclasses should decide which product gets created
- construction logic is starting to spread into business code

## Pros and cons
**Pros**
- Reduces coupling to concrete products
- Supports the Open/Closed Principle for new products
- Localizes creation logic

**Cons**
- Can introduce extra creator subclasses
- May be heavier than a simple factory function if subclass variation is not needed

## Related patterns
- [Abstract Factory](abstract-factory.md) often builds on Factory Methods.
- [Prototype](prototype.md) can replace subclass-based creation when cloning is easier.
- [Template Method](../behavioral/template-method.md) often appears alongside a factory method in a creator's workflow.

## TypeScript sketch
```ts
interface DialogButton {
  render(): string;
}

class WebButton implements DialogButton {
  render() { return 'web-button'; }
}

class DesktopButton implements DialogButton {
  render() { return 'desktop-button'; }
}

abstract class Dialog {
  protected abstract createButton(): DialogButton;

  renderPage() {
    return this.createButton().render();
  }
}

class WebDialog extends Dialog {
  protected createButton() { return new WebButton(); }
}

class DesktopDialog extends Dialog {
  protected createButton() { return new DesktopButton(); }
}
```

## PR review cues
- Good fit if the PR removes concrete product coupling while preserving creator logic.
- Red flag if there is only one product and subclassing adds ceremony without variation.

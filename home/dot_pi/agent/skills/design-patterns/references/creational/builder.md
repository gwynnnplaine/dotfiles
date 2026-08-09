# Builder

**Book reference:** *Dive Into Design Patterns*, pp. 106–124.

## Intent
Builder is a creational design pattern that lets you construct complex objects step by step and produce different representations using the same construction process.

## Problem
The book frames Builder around **constructor explosion** and scattered assembly logic. Complex objects may need many optional parts, ordered steps, or multiple representations built from similar steps.

## Solution
Extract construction into a builder interface with dedicated steps. A director may orchestrate standard build sequences, while concrete builders create different products or representations.

## Structure
- **Builder** interface with build steps
- **Concrete Builders** implementing steps
- **Director** optionally defining build order
- **Product** returned by a builder

## Applicability
Use it when:
- object creation requires many ordered or optional steps
- you need clearer assembly than giant constructors provide
- the same process can create different representations

## Pros and cons
**Pros**
- Step-by-step assembly is clearer than telescoping constructors
- Supports different representations with similar build logic
- Helps isolate construction from business logic

**Cons**
- Adds more moving parts than direct construction
- A director is unnecessary if there is only one simple construction path

## Related patterns
- [Abstract Factory](abstract-factory.md) returns families immediately; Builder assembles over time.
- [Factory Method](factory-method.md) is simpler when one call can create the product.
- [Composite](../structural/composite.md) is often built recursively with Builder-like assembly.

## TypeScript sketch
```ts
type Report = {
  title?: string;
  body?: string;
  footer?: string;
};

class ReportBuilder {
  private report: Report = {};

  setTitle(title: string) {
    this.report.title = title;
    return this;
  }

  setBody(body: string) {
    this.report.body = body;
    return this;
  }

  setFooter(footer: string) {
    this.report.footer = footer;
    return this;
  }

  build() {
    return { ...this.report };
  }
}
```

## PR review cues
- Good fit if the PR replaces unreadable constructors or repeated staged assembly.
- Red flag if the “builder” is just a verbose wrapper around a tiny object literal.

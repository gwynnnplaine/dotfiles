# Overview

Book-grounded quick chooser for the 22 GoF patterns in *Dive Into Design Patterns*.

## Families

### Creational
- **Factory Method** — delegate product creation to subclasses.
- **Abstract Factory** — create matching families of products.
- **Builder** — build complex objects step by step.
- **Prototype** — clone existing objects.
- **Singleton** — one instance with global access.

### Structural
- **Adapter** — convert one interface into another.
- **Bridge** — split abstraction from implementation.
- **Composite** — treat leaf and tree uniformly.
- **Decorator** — add behavior by wrapping.
- **Facade** — simplify a subsystem.
- **Flyweight** — share intrinsic state.
- **Proxy** — control access to a real object.

### Behavioral
- **Chain of Responsibility** — pass requests along handlers.
- **Command** — represent requests as objects.
- **Iterator** — traverse collections without exposing internals.
- **Mediator** — centralize component interaction.
- **Memento** — capture and restore state.
- **Observer** — notify subscribers of change.
- **State** — vary behavior by internal state.
- **Strategy** — swap algorithms.
- **Template Method** — define algorithm skeleton, vary steps.
- **Visitor** — add operations without changing element classes.

## Quick symptom triage

- Concrete classes leaking all over creation code → creational patterns
- Incompatible interfaces or exploding wrappers/hierarchies → structural patterns
- Runtime coordination, eventing, state changes, or algorithm swapping → behavioral patterns

## Important distinctions

- **Factory Method vs Abstract Factory**: one product vs families of related products
- **Builder vs Prototype**: assemble step by step vs clone a prepared object
- **Adapter vs Facade**: convert an interface vs simplify a subsystem
- **Decorator vs Proxy**: add responsibilities vs control access
- **Strategy vs State**: chosen algorithm vs behavior that changes with internal state
- **Strategy vs Template Method**: composition vs inheritance

## Start here, then drill down

- Foundational design lens: `principles.md`
- Creational index: `creational.md`
- Structural index: `structural.md`
- Behavioral index: `behavioral.md`

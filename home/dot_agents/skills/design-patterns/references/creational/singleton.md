# Singleton

**Book reference:** *Dive Into Design Patterns*, pp. 139–147.

## Intent
Singleton is a creational design pattern that ensures a class has only one instance while providing a global access point to it.

## Problem
The book explicitly notes that Singleton solves two concerns at once: one-instance control and global access. This is useful for shared resources, but it also risks violating the Single Responsibility Principle.

## Solution
Hide direct construction and expose a static access method that returns the sole instance.

## Structure
- **Singleton class**
- private or hidden constructor
- static storage for the single instance
- static access method

## Applicability
Use it when:
- exactly one shared instance is a real design requirement
- central access to a shared coordinator/resource is intentional

## Pros and cons
**Pros**
- Enforces a single shared instance
- Provides one access point
- Can delay construction until first use

**Cons**
- Introduces global state
- Hides dependencies
- Often harms testability and modularity
- Solves two responsibilities at once

## Related patterns
- [Facade](../structural/facade.md) and [Abstract Factory](abstract-factory.md) implementations are sometimes made singletons.
- [Flyweight](../structural/flyweight.md) is about many shared objects, not one global object.

## TypeScript sketch
```ts
class AppConfig {
  private static instance?: AppConfig;

  private constructor(readonly env: string) {}

  static getInstance() {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig(process.env.NODE_ENV ?? 'dev');
    }
    return AppConfig.instance;
  }
}
```

## PR review cues
- Good fit only if “single instance” is a real invariant.
- Red flag if Singleton is used as hidden dependency injection.

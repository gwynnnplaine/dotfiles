# Proxy

**Book reference:** *Dive Into Design Patterns*, pp. 236–247.

## Intent
Proxy is a structural design pattern that lets you provide a substitute or placeholder for another object and control access to it.

## Problem
The book's problem is needing the same interface while adding access control, lazy loading, caching, logging, or remote indirection around a real service.

## Solution
Create a proxy with the same interface as the real subject. The proxy manages access and delegates to the real subject when appropriate.

## Structure
- **Subject** common interface
- **Real Subject** doing the real work
- **Proxy** implementing the same interface and controlling access
- **Client** using the subject abstraction

## Applicability
Use it when:
- you need lazy initialization, caching, access control, logging, or remote stand-ins
- the client should not know whether it talks to a proxy or the real object

## Pros and cons
**Pros**
- Controls access transparently
- Supports lazy loading and caching
- Keeps the same interface for clients

**Cons**
- Adds another layer of indirection
- Can complicate lifecycle and debugging
- May increase response latency in some scenarios

## Related patterns
- [Adapter](adapter.md) changes the interface; Proxy preserves it.
- [Decorator](decorator.md) also wraps, but its intent is added responsibility rather than guarded access.
- [Facade](facade.md) simplifies a subsystem instead of standing in for one subject.

## TypeScript sketch
```ts
interface Image {
  display(): string;
}

class RealImage implements Image {
  constructor(private filename: string) {}
  display() { return `display:${this.filename}`; }
}

class LazyImageProxy implements Image {
  private real?: RealImage;

  constructor(private filename: string) {}

  display() {
    this.real ??= new RealImage(this.filename);
    return this.real.display();
  }
}
```

## PR review cues
- Good fit if the PR keeps the same subject interface while adding controlled access.
- Red flag if the code actually changes the interface or adds unrelated new responsibilities.

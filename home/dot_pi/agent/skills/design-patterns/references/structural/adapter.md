# Adapter

**Book reference:** *Dive Into Design Patterns*, pp. 151–164.

## Intent
Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate.

## Problem
The book frames Adapter around a useful class or library that cannot be used directly because its interface or data format does not match the rest of the application.

## Solution
Wrap the incompatible object in an adapter that exposes the interface the client expects and translates calls and data into the wrapped service's shape.

## Structure
- **Client** using a target interface
- **Client interface / Target** expected by the client
- **Service / Adaptee** with the incompatible interface
- **Adapter** implementing the target and translating to the adaptee

## Applicability
Use it when:
- you must integrate a legacy or third-party class with the wrong interface
- you want to reuse existing subclasses through a common wrapper

## Pros and cons
**Pros**
- Separates conversion logic from business logic
- Lets incompatible code collaborate without rewriting the service
- Supports extension with new adapters

**Cons**
- Adds extra interfaces/classes
- Sometimes changing the service directly would be simpler

## Related patterns
- [Bridge](bridge.md) is designed up front; Adapter usually retrofits an existing mismatch.
- [Decorator](decorator.md) preserves or extends an interface, while Adapter changes it.
- [Proxy](proxy.md) keeps the same interface and controls access.
- [Facade](facade.md) simplifies a subsystem rather than translating one object's interface.

## TypeScript sketch
```ts
class LegacyXmlApi {
  fetchUserXml() {
    return '<user><name>Ada</name></user>';
  }
}

interface UserApi {
  getUser(): { name: string };
}

class XmlUserAdapter implements UserApi {
  constructor(private legacy: LegacyXmlApi) {}

  getUser() {
    const xml = this.legacy.fetchUserXml();
    const name = xml.match(/<name>(.*)<\/name>/)?.[1] ?? 'unknown';
    return { name };
  }
}
```

## PR review cues
- Good fit if the PR preserves a useful existing service and only translates its boundary.
- Red flag if the wrapper changes behavior so much that it is really a Facade or Decorator instead.

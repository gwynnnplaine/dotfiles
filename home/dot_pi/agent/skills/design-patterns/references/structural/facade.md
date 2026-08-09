# Facade

**Book reference:** *Dive Into Design Patterns*, pp. 212–221.

## Intent
Facade is a structural design pattern that provides a simplified interface to a library, a framework, or any other complex set of classes.

## Problem
The book's problem is subsystem complexity leaking into callers: too many objects, too many setup steps, and too much knowledge of internal order or dependencies.

## Solution
Introduce a facade that exposes a higher-level interface for common tasks while delegating to the underlying subsystem.

## Structure
- **Facade** exposing a simplified API
- **Subsystem classes** doing the real work
- **Client** optionally using the facade instead of direct subsystem calls

## Applicability
Use it when:
- a subsystem is hard to understand or use directly
- most callers need a simpler entry point
- you want to layer access to a subsystem

## Pros and cons
**Pros**
- Reduces coupling to subsystem details
- Makes common workflows easier to use
- Provides a clear entry boundary

**Cons**
- Can become a god object if it absorbs too much knowledge
- May hide useful subsystem capabilities from advanced callers

## Related patterns
- [Adapter](adapter.md) converts a mismatched interface; Facade simplifies an existing subsystem.
- [Abstract Factory](../creational/abstract-factory.md) can also hide concrete subsystem classes, but through families of products.
- [Singleton](../creational/singleton.md) is sometimes used for a facade instance.

## TypeScript sketch
```ts
class VideoDecoder {
  decode(file: string) { return `decoded:${file}`; }
}

class AudioMixer {
  mix(track: string) { return `mixed:${track}`; }
}

class Exporter {
  export(data: string, format: string) { return `${data}->${format}`; }
}

class VideoConversionFacade {
  constructor(
    private decoder = new VideoDecoder(),
    private mixer = new AudioMixer(),
    private exporter = new Exporter(),
  ) {}

  convert(file: string, format: 'mp4' | 'webm') {
    const decoded = this.decoder.decode(file);
    const mixed = this.mixer.mix(decoded);
    return this.exporter.export(mixed, format);
  }
}
```

## PR review cues
- Good fit if the PR hides repeated subsystem choreography behind one clean entry point.
- Red flag if the facade starts owning unrelated business rules.

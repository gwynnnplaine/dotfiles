# Memento

**Book reference:** *Dive Into Design Patterns*, pp. 322–337.

## Intent
Memento is a behavioral design pattern that lets you save and restore the previous state of an object without revealing the details of its implementation.

## Problem
The book frames this around snapshots and undo. External code wants to restore an object's prior state, but exposing internals breaks encapsulation.

## Solution
The originator creates mementos that capture its own internal state. A caretaker stores mementos but does not inspect or modify their contents.

## Structure
- **Originator** creating/restoring mementos
- **Memento** storing a snapshot
- **Caretaker** keeping history

## Applicability
Use it when:
- you need undo, rollback, checkpoints, or history
- object internals should stay encapsulated

## Pros and cons
**Pros**
- Preserves encapsulation while supporting restore
- Makes undo/history explicit

**Cons**
- Snapshots may consume significant memory
- Lifecycle of many mementos can become expensive

## Related patterns
- [Command](command.md) often uses Memento to implement undo.
- [Prototype](../creational/prototype.md) also copies state, but for creating new objects rather than restoring old state.

## TypeScript sketch
```ts
class EditorMemento {
  constructor(readonly value: string) {}
}

class Editor {
  constructor(private value = '') {}

  type(text: string) {
    this.value += text;
  }

  save() {
    return new EditorMemento(this.value);
  }

  restore(memento: EditorMemento) {
    this.value = memento.value;
  }
}
```

## PR review cues
- Good fit if the PR needs restoration without exposing internals.
- Red flag if snapshots are public bags of mutable state.

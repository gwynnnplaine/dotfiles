# Command

**Book reference:** *Dive Into Design Patterns*, pp. 270–290.

## Intent
Command is a behavioral design pattern that turns a request into a stand-alone object containing all information about the request.

## Problem
The book motivates Command with UI actions, queued work, history, delayed execution, and undo. Direct method calls make these harder because the request is not a first-class value.

## Solution
Encapsulate a request in a command object with an execution method. Senders invoke commands without knowing the receiver's concrete details.

## Structure
- **Command** interface
- **Concrete Commands** binding receiver + action + parameters
- **Receiver** doing real work
- **Invoker** triggering commands
- optional **history** for undo

## Applicability
Use it when:
- you need queues, delayed execution, history, undo, redo, or macro commands
- senders should be decoupled from receivers

## Pros and cons
**Pros**
- Treats requests as objects
- Supports undo/history and queued work
- Decouples invoker from receiver

**Cons**
- Adds many command classes or objects
- Can be too indirect for trivial actions

## Related patterns
- [Memento](memento.md) often complements Command for undo.
- [Chain of Responsibility](chain-of-responsibility.md), [Mediator](mediator.md), and [Observer](observer.md) route requests differently.
- [Prototype](../creational/prototype.md) can help clone configured commands.

## TypeScript sketch
```ts
interface Command {
  execute(): void;
  undo(): void;
}

class TextEditor {
  value = '';
}

class InsertTextCommand implements Command {
  constructor(private editor: TextEditor, private text: string) {}

  execute() {
    this.editor.value += this.text;
  }

  undo() {
    this.editor.value = this.editor.value.slice(0, -this.text.length);
  }
}
```

## PR review cues
- Good fit if the PR needs request objects, not just callbacks.
- Red flag if Command is added where a simple function value would do.

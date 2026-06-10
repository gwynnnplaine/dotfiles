# State

**Book reference:** *Dive Into Design Patterns*, pp. 354–369.

## Intent
State is a behavioral design pattern that lets an object alter its behavior when its internal state changes. It appears as if the object changed its class.

## Problem
The book motivates State with large conditional logic driven by internal modes. As states multiply, one class becomes hard to read and modify.

## Solution
Extract state-specific behavior into separate state objects behind a common interface. The context delegates behavior to the current state and can switch states over time.

## Structure
- **Context** holding current state
- **State** interface
- **Concrete States** implementing behavior and transitions

## Applicability
Use it when:
- behavior changes based on internal state
- state-dependent branches are getting large or repetitive
- valid transitions matter to the design

## Pros and cons
**Pros**
- Localizes state-specific behavior
- Removes large conditional branches from the context
- Makes transitions explicit

**Cons**
- Adds classes/objects for each state
- Can be excessive for tiny state sets with trivial behavior

## Related patterns
- [Strategy](strategy.md) and State look structurally similar; the difference is intent.
- [Bridge](../structural/bridge.md) also delegates via composition but solves a different problem.
- [Flyweight](../structural/flyweight.md) can sometimes share stateless state objects.

## TypeScript sketch
```ts
interface PlayerState {
  press(player: AudioPlayer): string;
}

class AudioPlayer {
  constructor(private state: PlayerState) {}
  setState(state: PlayerState) { this.state = state; }
  press() { return this.state.press(this); }
}

class PlayingState implements PlayerState {
  press(player: AudioPlayer) {
    player.setState(new PausedState());
    return 'pause';
  }
}

class PausedState implements PlayerState {
  press(player: AudioPlayer) {
    player.setState(new PlayingState());
    return 'play';
  }
}
```

## PR review cues
- Good fit if the PR moves real state-dependent behavior out of giant conditionals.
- Red flag if “state” objects are just manually selected strategies with no internal transitions.

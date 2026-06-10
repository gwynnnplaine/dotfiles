# Behavioral Patterns

Use these when the core pressure is **how objects communicate, coordinate, or vary behavior**.

- [Chain of Responsibility](behavioral/chain-of-responsibility.md) — pp. 252–269
- [Command](behavioral/command.md) — pp. 270–290
- [Iterator](behavioral/iterator.md) — pp. 291–305
- [Mediator](behavioral/mediator.md) — pp. 306–321
- [Memento](behavioral/memento.md) — pp. 322–337
- [Observer](behavioral/observer.md) — pp. 338–353
- [State](behavioral/state.md) — pp. 354–369
- [Strategy](behavioral/strategy.md) — pp. 370–382
- [Template Method](behavioral/template-method.md) — pp. 383–394
- [Visitor](behavioral/visitor.md) — pp. 395–410

## How to choose inside this family
- Need sequential handlers → Chain of Responsibility
- Need to package actions → Command
- Need collection traversal abstraction → Iterator
- Need central coordination → Mediator
- Need snapshots/undo of internal state → Memento
- Need subscriptions → Observer
- Need behavior that changes with internal mode → State
- Need interchangeable algorithms → Strategy
- Need inheritance-based algorithm skeleton → Template Method
- Need new operations over a stable object structure → Visitor

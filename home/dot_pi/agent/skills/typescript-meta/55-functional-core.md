# READ WHEN choosing functional core vs imperative shell

Prefer functional composition for business logic. Keep effects at the edges.

## Functional core defaults

- Business functions take explicit inputs and return explicit outputs.
- Avoid hidden reads, hidden writes, and ambient dependencies in domain logic.
- Prefer small pure transformations that compose through `map`, `andThen`/`flatMap`, `mapErr`, or plain function composition.
- Make success and failure paths visible.
- Keep data immutable unless mutation is a measured hot-path optimization.

## Imperative shell

Put side effects in boundary code:

- HTTP handlers
- CLI commands
- UI event handlers
- persistence adapters
- external API clients
- logging, metrics, tracing

Boundary code may orchestrate effects, map errors to outputs, and call infrastructure.

## When OOP fits

Use classes or objects with state when identity, lifecycle, stateful resources, framework integration, or polymorphic adapters are the central concern.

Good fits:

- database/client wrappers
- resource managers
- framework-required classes
- long-lived services with lifecycle
- adapters behind interfaces

Avoid classes that only group stateless utility functions.

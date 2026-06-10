# READ WHEN choosing coupling strategy

## Option A: tight links (`User['id']`, shared entities)

- Pros: consistency, discoverability.
- Cons: ripple breakages across modules.

## Option B: layer-local contracts (`DbUser`, `UserDto`, `UserResult`)

- Pros: change isolation.
- Cons: mapping overhead.

## Default policy

- Use local/module types inside layers.
- Use shared/generated contracts at boundaries.
- If code mixes business + infrastructure concerns, explicitly choose style before edits:
  - Business style: documentation/context-first types.
  - Infrastructure style: strict contract-first types.

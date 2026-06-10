# DONE checklist

Before final output/code:

- [ ] Boundary inputs validated (or explicitly justified as trusted).
- [ ] Union handling is discriminator-based and exhaustive where applicable.
- [ ] Coupling strategy chosen intentionally (tight link vs layer-local).
- [ ] Contract approach matches boundary policy (generated/shared when possible).
- [ ] Domain primitives are branded when mixups or invariants are realistic.
- [ ] Expected business failures are typed values, or exceptions are justified.
- [ ] Business transformations prefer functional data-in/data-out style.
- [ ] No accidental `any` / double-assertion shortcuts.
- [ ] Business vs infrastructure style explicitly chosen when mixed.
- [ ] Solution matches existing project TypeScript patterns.

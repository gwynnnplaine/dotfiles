# TypeScript Rules Index (Progressive Disclosure)

Read in this order:
1. [00-must-have.md](00-must-have.md)
2. [05-type-safety-philosophy.md](05-type-safety-philosophy.md)
3. Relevant `READ WHEN` file(s)
4. [99-done-checklist.md](99-done-checklist.md)

## READ WHEN map

- Object shape / excess properties -> [10-object-types.md](10-object-types.md)
- Branded/domain primitive types -> [15-branded-domain-types.md](15-branded-domain-types.md)
- Union narrowing / control flow -> [20-narrowing-unions.md](20-narrowing-unions.md)
- Runtime boundaries / validation -> [30-trust-boundaries.md](30-trust-boundaries.md)
- Runtime schemas / decoding -> [35-runtime-schemas.md](35-runtime-schemas.md)
- Type coupling strategy -> [40-coupling-contracts.md](40-coupling-contracts.md)
- Typed expected failures / Result / Effect-style operations -> [45-typed-errors-results-effects.md](45-typed-errors-results-effects.md)
- Generics / overloads / utility types -> [50-generics-overloads-utilities.md](50-generics-overloads-utilities.md)
- Functional core / imperative shell -> [55-functional-core.md](55-functional-core.md)
- Variance / compatibility -> [60-variance-compatibility.md](60-variance-compatibility.md)
- Frontend/backend type sync -> [70-fe-be-sync.md](70-fe-be-sync.md)
- Reliability strictness calibration -> [80-strictness-calibration.md](80-strictness-calibration.md)

## Policy decisions

- Local vs shared types: local inside modules, shared/generated contracts at boundaries.
- Strong defaults: runtime decoding, branded domain primitives, typed expected failures, and functional business core.
- Dependency policy: use project-native libraries first; ask before adding schema/Result/Effect dependencies.
- `any`: allowed only with explicit reason + planned removal.
- TS gate: always read MUST HAVE and type-safety philosophy; then only relevant `READ WHEN` docs.
- Business vs infrastructure style: must be explicit when mixed.

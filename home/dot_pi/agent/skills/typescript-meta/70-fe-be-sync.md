# READ WHEN syncing frontend/backend types

Priority order:

1. Design-first contract generation (best SSOT)
2. Code-first schema generation
3. Shared TypeScript package/module
4. Manual duplicated typing (last resort)

Operational rules:

- Regenerate contracts/types in CI.
- Fail CI on schema drift.

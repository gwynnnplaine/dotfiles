# READ WHEN decoding runtime data

Runtime data is untrusted until decoded. Static TypeScript types do not validate JSON, user input, storage, or external systems.

## Mandatory decode points

- Backend reads from users, HTTP, queues, webhooks, and external APIs.
- Frontend reads from users, backend responses, `localStorage`, `IndexedDB`, URLs, and third-party SDKs.
- Service-to-service reads unless there is a documented trusted boundary.

## Critical write checks

Validate before irreversible or high-impact writes:

- payments and money movement
- permission or ownership changes
- destructive operations
- external system mutations

## Egress validation

Validate outgoing data when correctness is critical, the contract is public, or similar bugs have happened before. Do not validate every internal return value by default.

## Preferred shape

- Boundary receives `unknown`.
- Decode once into a trusted type.
- Internal code accepts the trusted type.
- Do not pass raw untrusted values deeper into the system.

```ts
function decodeCreateUserRequest(input: unknown): CreateUserRequest {
	// Use the project schema library or a local validator here.
	return validatedRequest;
}
```

## Library policy

Use the project's existing schema stack first: Zod, Valibot, ArkType, Effect Schema, generated OpenAPI/GraphQL validators, or local validators. Ask before adding a new dependency.

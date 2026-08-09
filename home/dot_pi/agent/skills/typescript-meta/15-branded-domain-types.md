# READ WHEN modeling branded/domain primitive types

Use branded/domain primitives when plain `string` or `number` values are easy to mix up or carry domain invariants.

## Use for

- Entity identifiers: `UserId`, `CompanyId`, `OrderId`.
- External identifiers: provider account IDs, payment IDs, webhook IDs.
- Validated formats: `Email`, `Url`, `IsoDateString`.
- Units and money: `Cents`, `Dollars`, `Kilometers`, `Milliseconds`.

## Avoid for

- Short-lived local variables.
- Values with no stable domain meaning.
- Shapes where a full object type communicates the invariant better.

## Pattern

- Create brands at validation/construction boundaries.
- Keep constructors narrow and explicit.
- Do not cast to a brand in business code unless the invariant has just been proven.

```ts
type Brand<Value, Name extends string> = Value & { readonly __brand: Name };

type UserId = Brand<string, 'UserId'>;
type CompanyId = Brand<string, 'CompanyId'>;

function parseUserId(value: unknown): UserId {
	if (typeof value !== 'string' || value.length === 0) {
		throw new Error('Invalid user id');
	}

	return value as UserId;
}
```

## Rule of thumb

Brand by risk and domain significance, not by ideology.

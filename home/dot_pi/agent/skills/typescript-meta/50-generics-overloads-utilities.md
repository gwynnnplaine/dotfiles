# READ WHEN writing generics / overloads / utility types

## Generics

- Name generic parameters by meaning (`Value`, `Entity`, `Key`) when useful.
- `extends` expresses shape/capability constraints.
- Inference comes from the call signature: parameters, constraints, contextual types, and declared return relationships.
- Inference does not come from function body internals. When explaining or reviewing generics, say this explicitly because implementation cleverness cannot fix a weak public signature.
- Later generic parameters may depend on earlier ones.

```ts
function pick<Obj extends object, Key extends keyof Obj>(obj: Obj, key: Key) {
  return obj[key];
}
```

## Overloads

- Overloads are manual contracts; implementation must match.
- Use overloads for finite known variants.
- Use generics for parametric/infinite families.

```ts
function qs(sel: 'button'): HTMLButtonElement;
function qs(sel: string): Element | null;
function qs(sel: string): Element | null {
  return document.querySelector(sel);
}
```

## Utility shortlist

- Async: `Awaited`
- Object: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`
- Union: `Exclude`, `Extract`, `NonNullable`
- Functions/classes: `Parameters`, `ReturnType`, `ConstructorParameters`, `InstanceType`
- Inference/this/strings: `NoInfer`, `ThisType`, `OmitThisParameter`, `Uppercase`/`Lowercase`/`Capitalize`/`Uncapitalize`

# Exograph Deno Utils

Utilities that improve developer experience when building Deno modules in [Exograph](https://exograph.dev/).

## Features
- GraphQL Type Generation

## GraphQL Type Generation

### Quick Start
```sh
# Initialize
deno run -A https://deno.land/x/exograph_deno_utils@v0.0.6/codegen.ts init

# Generate typed documents for all operations using the generated `graphql()`
# function from `src/gql.ts`
deno run -A https://deno.land/x/exograph_deno_utils@v0.0.6/codegen.ts
```

```ts
import type { ExographPriv } from "../generated/exograph.d.ts";

// Use this to define operations
import { graphql } from "./gql.ts";

// Helper function that infers types from typed operations
import { executeQueryPriv } from "https://deno.land/x/exograph_deno_utils@v0.0.6/mod.ts";

const venuesDocument = graphql(`
  query venues($param: String!) {
    venues(where: { name: { eq: $param } }) {
      name
    }
  }
`);

// Uncommenting the lines below will cause type errors that prevent incorrect usage
// of the operations and their associated data
export async function doSomething(
  name: string,
  exograph: ExographPriv,
): Promise<string[]> {
  const { venues } = await executeQueryPriv(exograph, venuesDocument, {
    param: name
    // wrongParam: 'value' - Error: Object literal may only specify known properties
  });

  // venues.map(v => v.nonExistent).join(','); - Error: Property 'nonExistent' does not exist

  return venues.map((v) => v.name).join(",");
}
```

### Overview

Exograph allows you to interact with your schema using GraphQL operations in your Deno modules. However, working with un-typed GraphQL code can be error prone. Several tools exist that allow you to generate Typescript types for your GraphQL operations, the most prominent being [GraphQL Code Generator](https://the-guild.dev/graphql/codegen). However, since it does not "officially" support Deno, setting it up can be a pain. `codegen.ts` provides a hassle-free type generation experience when working with GraphQL operations inside Exograph's Deno modules.

#### Initializing

```sh
deno run -A https://deno.land/x/exograph_deno_utils@v0.0.6/codegen.ts init
```

This will generate a `gql.ts` file inside the `src` folder (configurable) which contains a `graphql()` function that you can use to write your GraphQL operations.

> [!NOTE]
> The `graphql()` function will also enable syntax highlighting for GraphQL operations in most IDEs (might require some configurations/extensions)

```ts
import { graphql } from "./gql.ts";

const venuesDocument = graphql(`
  query venues($param: String!) {
    venues(where: {name: {eq: $param}}) {
      name
    }
  }
`);
```

#### Type Generation and Usage

```sh
deno run -A https://deno.land/x/exograph_deno_utils@v0.0.6/codegen.ts
```

This will generate typed operations for all operations defined using `graphql()` and automatically return the typed documents from the function calls.

The generated types can be used in calls to `executeQueryPriv()` or `executeQuery()` from `gql.ts` which are wrappers functions that infer the response and variable types from the typed documents.

```ts
import type { Exograph } from "../generated/exograph.d.ts";
import { executeQuery } from "https://deno.land/x/exograph_deno_utils@v0.0.6/mod.ts";

export async function process(exograph: Exograph): Promise<string> {
  // `venues` has the correct inferred type based on the query above
  const { venues } = await executeQuery(
    exograph,
    venuesDocument,
    {
      param: "Foo", // has the correct inferred type

      // wrongParam: 'value' - Error: Object literal may only specify known properties
    },
  );

  // venues.map(v => v.nonExistent).join(','); - Error: Property 'nonExistent' does not exist

  return venues.map((v) => v.name).join(",");
}
```

### Configuration

| Flag         | Description                                                       | Default                         |
| ------------ | ----------------------------------------------------------------- | ------------------------------- |
| `--inputs`   | A glob pattern for Typescript files containing GraphQL operations | `src/**/*.ts`                   |
| `--output`   | File path where the generated code will be saved                  | `src/gql.ts`                    |
| `--endpoint` | URL of the Exograph GraphQL endpoint                              | `http://localhost:9876/graphql` |

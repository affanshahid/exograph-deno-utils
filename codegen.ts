import { codegen } from "npm:@graphql-codegen/core";
import {
  FragmentDefinitionNode,
  OperationDefinitionNode,
  parse,
  printSchema,
} from "npm:graphql";
import * as typescriptPlugin from "npm:@graphql-codegen/typescript";
import * as operationsPlugin from "npm:@graphql-codegen/typescript-operations";
import * as typedDocumentPlugin from "npm:@graphql-codegen/typed-document-node";
import * as gqlTagPlugin from "npm:@graphql-codegen/gql-tag-operations";
import { loadDocuments, loadSchema } from "npm:@graphql-tools/load";
import { UrlLoader } from "npm:@graphql-tools/url-loader";
import { CodeFileLoader } from "npm:@graphql-tools/code-file-loader";
import { Source } from "npm:@graphql-tools/utils";
import { ClientSideBaseVisitor } from "npm:@graphql-codegen/visitor-plugin-common";
import { parseArgs } from "https://deno.land/std@0.224.0/cli/mod.ts";

interface Args {
  output?: string;
  endpoint?: string;
  _: string[];
}

const args: Args = parseArgs(Deno.args);

const outputFile = args.output ?? "src/gql.ts";

if (args._.includes("init")) {
  await Deno.writeFile(
    outputFile,
    new TextEncoder().encode(
      `export function gql(source: string): unknown { return  {}; }`,
    ),
  );

  console.log("Initialized!");
}

const schema = await loadSchema(
  args.endpoint ?? "http://localhost:9876/graphql",
  {
    loaders: [new UrlLoader()],
  },
);

const documents = await loadDocuments("./src/**/*.ts", {
  loaders: [new CodeFileLoader({ pluckConfig: { skipIndent: true } })],
});

const schemaDocument = parse(printSchema(schema));

const visitor = new ClientSideBaseVisitor(schema, [], {}, {});

const sourcesWithOperations = processSources(documents, (node) => {
  if (node.kind === "FragmentDefinition") {
    return visitor.getFragmentVariableName(node);
  }
  return visitor.getOperationVariableName(node);
});

let output = await codegen({
  documents,
  config: {},
  filename: outputFile,
  schema: schemaDocument,
  plugins: [
    {
      typescript: {
        strictScalars: true,
        skipTypename: true,
        scalars: {
          Decimal: "number",
          Instant: "string",
          LocalDate: "string",
          LocalDateTime: "string",
          LocalTime: "string",
          Json: "unknown",
          Uuid: "string",
          Vector: "unknown",
        },
      },
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
  },
});

output += await codegen({
  documents,
  config: {},
  filename: outputFile,
  schema: schemaDocument,
  plugins: [
    {
      operations: {},
    },
  ],
  pluginMap: {
    operations: operationsPlugin,
  },
});

output += await codegen({
  documents,
  config: {},
  filename: outputFile,
  schema: schemaDocument,
  plugins: [
    {
      typedDocument: {},
    },
  ],
  pluginMap: {
    typedDocument: typedDocumentPlugin,
  },
});

output += "\n";
output += await codegen({
  documents,
  config: {},
  filename: outputFile,
  schema: schemaDocument,
  plugins: [
    {
      gqlOperations: { sourcesWithOperations },
    },
  ],
  pluginMap: {
    gqlOperations: gqlTagPlugin,
  },
});

output = output.replace("import * as types from './graphql.js';", "");
output = output.replaceAll("types.", "");
output = output.replaceAll(
  "import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';",
  "",
);
output = output.replaceAll("DocumentNode", "TypedDocumentNode");

// Copied from https://github.com/dotansimha/graphql-typed-document-node/blob/master/packages/core/src/index.ts
output =
  `// deno-lint-ignore-file

import { TypedDocumentNode } from "https://deno.land/x/exograph_deno_utils@v0.0.1/mod.ts";
` + output;

await Deno.writeFile(outputFile, new TextEncoder().encode(output));

console.log("Outputs generated!");

// The following is copied from
// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/presets/client/src/process-sources.ts
export type BuildNameFunction = (
  type: OperationDefinitionNode | FragmentDefinitionNode,
) => string;

export function processSources(
  sources: Array<Source>,
  buildName: BuildNameFunction,
) {
  const sourcesWithOperations: Array<gqlTagPlugin.SourceWithOperations> = [];

  for (const originalSource of sources) {
    const source = fixLinebreaks(originalSource);
    const { document } = source;
    const operations: Array<gqlTagPlugin.OperationOrFragment> = [];

    for (const definition of document?.definitions ?? []) {
      if (
        definition?.kind !== `OperationDefinition` &&
        definition?.kind !== "FragmentDefinition"
      )
        continue;

      if (definition.name?.kind !== `Name`) {
        if (definition?.kind === `OperationDefinition`) {
          console.warn(
            `[client-preset] the following anonymous operation is skipped: ${source.rawSDL}`,
          );
        }
        continue;
      }

      operations.push({
        initialName: buildName(definition),
        definition,
      });
    }

    if (operations.length === 0) continue;

    sourcesWithOperations.push({
      source,
      operations,
    });
  }

  return sourcesWithOperations;
}

function fixLinebreaks(source: Source) {
  const fixedSource = { ...source };

  fixedSource.rawSDL = source.rawSDL!.replace(/\r\n/g, "\n");

  return fixedSource;
}

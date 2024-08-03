import { codegen } from "npm:@graphql-codegen/core";
import * as typescriptPlugin from "npm:@graphql-codegen/typescript";
import * as operationsPlugin from "npm:@graphql-codegen/typescript-operations";
import * as typedDocumentPlugin from "npm:@graphql-codegen/typed-document-node";
import * as gqlTagPlugin from "npm:@graphql-codegen/gql-tag-operations";
import { Types } from "npm:@graphql-codegen/plugin-helpers";
import { DocumentNode, GraphQLSchema } from "npm:graphql";
import { Source } from "npm:@graphql-tools/utils";
import { ClientSideBaseVisitor } from "npm:@graphql-codegen/visitor-plugin-common";
import { processSources } from "./process-sources.ts";

export async function generateSchemaTypes(
  schemaDocument: DocumentNode,
  documents: Types.DocumentFile[],
): Promise<string> {
  return await codegen({
    documents,
    config: {},
    filename: "__does_not_exist.ts",
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
            Vector: "number[]",
          },
        },
      },
    ],
    pluginMap: { typescript: typescriptPlugin },
  });
}

export async function generateOperationTypes(
  schemaDocument: DocumentNode,
  documents: Types.DocumentFile[],
): Promise<string> {
  return await codegen({
    documents,
    config: {},
    filename: "__does_not_exist.ts",
    schema: schemaDocument,
    plugins: [{ operations: {} }],
    pluginMap: { operations: operationsPlugin },
  });
}

export async function generateTypedDocuments(
  schemaDocument: DocumentNode,
  documents: Types.DocumentFile[],
): Promise<string> {
  const output = await codegen({
    documents,
    config: {},
    filename: "__does_not_exist.ts",
    schema: schemaDocument,
    plugins: [
      {
        typedDocument: {
          documentMode: "string",
        },
      },
    ],
    pluginMap: {
      typedDocument: typedDocumentPlugin,
    },
  });

  return (
    output.replaceAll(
      "import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';",
      "import { DocumentTypeDecoration } from 'https://deno.land/x/exograph_deno_utils@v0.0.7/mod.ts';",
    ) + "\n"
  );
}

export async function generateGqlTagOperations(
  schemaDocument: DocumentNode,
  documents: Types.DocumentFile[],
  schema: GraphQLSchema,
): Promise<string> {
  const visitor = new ClientSideBaseVisitor(schema, [], {}, {});

  const sourcesWithOperations = processSources(
    documents as Source[],
    (node) => {
      if (node.kind === "FragmentDefinition") {
        return visitor.getFragmentVariableName(node);
      }
      return visitor.getOperationVariableName(node);
    },
  );

  const output = await codegen({
    documents,
    config: {},
    filename: "__does_not_exist.ts",
    schema: schemaDocument,
    plugins: [
      {
        gqlOperations: {
          sourcesWithOperations,
          gqlTagName: "graphql",
          documentMode: "string",
        },
      },
    ],
    pluginMap: {
      gqlOperations: gqlTagPlugin,
    },
  });

  return output
    .replaceAll("import * as types from './graphql.js';\n", "")
    .replaceAll("types.", "")
    .replaceAll("typeof import('./graphql.js').", "typeof ");
}

export function generateHeader(): string {
  return "// deno-lint-ignore-file\n\n";
}

export function generateGqlStub(): string {
  return `export function graphql(source: string): unknown { return  {}; }`;
}

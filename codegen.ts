import { parse, printSchema } from "npm:graphql";
import { loadDocuments, loadSchema } from "npm:@graphql-tools/load";
import { UrlLoader } from "npm:@graphql-tools/url-loader";
import { CodeFileLoader } from "npm:@graphql-tools/code-file-loader";
import { parseArgs } from "https://deno.land/std@0.224.0/cli/mod.ts";
import {
  generateGqlStub,
  generateGqlTagOperations,
  generateTypedDocuments,
  generateHeader,
} from "./lib/codegen.ts";
import { generateSchemaTypes } from "./lib/codegen.ts";
import { generateOperationTypes } from "./lib/codegen.ts";

interface Args {
  output?: string;
  endpoint?: string;
  inputs?: string;
  _: string[];
}

const args: Args = parseArgs(Deno.args);

const inputFiles = args.inputs ?? "src/**/*.ts";
const outputFile = args.output ?? "src/gql.ts";
const endpoint = args.endpoint ?? "http://localhost:9876/graphql";
const isInit = args._.includes("init");

if (isInit) {
  await Deno.writeFile(outputFile, new TextEncoder().encode(generateGqlStub()));
  console.log("Initialized!");
  Deno.exit();
}

const documents = await loadDocuments(inputFiles, {
  loaders: [new CodeFileLoader({ pluckConfig: { skipIndent: true } })],
});

const schema = await loadSchema(endpoint, {
  loaders: [new UrlLoader()],
});
const schemaDocument = parse(printSchema(schema));

let output = await generateSchemaTypes(schemaDocument, documents);
output += await generateOperationTypes(schemaDocument, documents);
output += await generateTypedDocuments(schemaDocument, documents);
output += await generateGqlTagOperations(schemaDocument, documents, schema);
output = generateHeader() + output;

await Deno.writeFile(outputFile, new TextEncoder().encode(output));
console.log("Output generated!");

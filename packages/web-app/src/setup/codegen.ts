import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/setup/definitions/schema.graphql",
  generates: {
    // Server-side types (Resolvers, etc.)
    "./src/setup/generated/typesServer.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
      ],
      config: {
        // Server-specific config can go here
        useIndexSignature: true,
      },
    },
    // Client-side types (Operations like queries, mutations)
    "./src/setup/generated/typesClient.ts": {
      plugins: [
        "typescript",
        "typescript-operations", // Generates types for queries, mutations, etc.
        "@graphql-codegen/typescript-react-apollo", // Correct plugin name
      ],
      config: {
        // Client-specific config can go here
        withHooks: true, // Generates Apollo hooks like useQuery, useMutation
      },
    },
    // Other configurations...
  },
};

export default config;

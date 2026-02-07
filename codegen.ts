import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3000/api/graphql',
  documents: ['src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: {
        legacyMode: false,
        fetcher: {
          func: "../gqlFetcher#gqlFetcher",
        },
        exposeQueryKeys: true,
        exposeFetcher: true,
        reactQueryVersion: 5,
      },
    },
  },
}

export default config

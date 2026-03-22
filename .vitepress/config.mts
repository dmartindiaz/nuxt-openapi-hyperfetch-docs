import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Nuxt OpenAPI Hyperfetch',
  description: 'Generate type-safe Nuxt composables from OpenAPI/Swagger specifications',
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.png' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Composables', link: '/composables/' },
      { text: 'Server', link: '/server/' },
      { text: 'Examples', link: '/examples/composables/basic/simple-get' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Nuxt OpenAPI Hyperfetch?', link: '/guide/what-is-nuxt-openapi-hyperfetch' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Generating Composables', link: '/guide/generating-composables' },
            { text: 'Choosing a Generator', link: '/guide/choosing-a-generator' },
          ],
        },
      ],

      '/composables/': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/composables/' },
          ],
        },
        {
          text: 'useFetch',
          items: [
            { text: 'Introduction', link: '/composables/use-fetch/' },
            { text: 'Basic Usage', link: '/composables/use-fetch/basic-usage' },
            { text: 'Configuration', link: '/composables/use-fetch/configuration' },
          ],
        },
        {
          text: 'useAsyncData',
          items: [
            { text: 'Introduction', link: '/composables/use-async-data/' },
            { text: 'Basic Usage', link: '/composables/use-async-data/basic-usage' },
            { text: 'Raw Responses', link: '/composables/use-async-data/raw-responses' },
            { text: 'vs useFetch', link: '/composables/use-async-data/vs-use-fetch' },
          ],
        },
        {
          text: 'Shared Features',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/composables/features/' },
            {
              text: 'Callbacks',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/composables/features/callbacks/overview' },
                { text: 'onRequest', link: '/composables/features/callbacks/on-request' },
                { text: 'onSuccess', link: '/composables/features/callbacks/on-success' },
                { text: 'onError', link: '/composables/features/callbacks/on-error' },
                { text: 'onFinish', link: '/composables/features/callbacks/on-finish' },
              ],
            },
            {
              text: 'Global Callbacks',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/composables/features/global-callbacks/overview' },
                { text: 'Setup', link: '/composables/features/global-callbacks/setup' },
                { text: 'Control Options', link: '/composables/features/global-callbacks/control-options' },
                { text: 'URL Patterns', link: '/composables/features/global-callbacks/patterns' },
              ],
            },
            { text: 'Request Interception', link: '/composables/features/request-interception' },
            { text: 'Data Transformation', link: '/composables/features/data-transformation' },
            { text: 'Authentication', link: '/composables/features/authentication' },
            { text: 'Error Handling', link: '/composables/features/error-handling' },
          ],
        },
      ],

      '/server/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/server/' },
            { text: 'Getting Started', link: '/server/getting-started' },
          ],
        },
        {
          text: 'BFF Pattern',
          items: [
            { text: 'What is BFF?', link: '/server/bff-pattern/' },
            { text: 'Architecture', link: '/server/bff-pattern/architecture' },
            { text: 'Generated vs Custom', link: '/server/bff-pattern/generated-vs-custom' },
            { text: 'Benefits', link: '/server/bff-pattern/benefits' },
          ],
        },
        {
          text: 'Auth Context',
          items: [
            { text: 'Overview', link: '/server/auth-context/' },
            { text: 'Setup', link: '/server/auth-context/setup' },
            { text: 'Integration', link: '/server/auth-context/integration' },
            { text: 'Examples', link: '/server/auth-context/examples' },
          ],
        },
        {
          text: 'Transformers',
          items: [
            { text: 'What are Transformers?', link: '/server/transformers/' },
            { text: 'Creating Transformers', link: '/server/transformers/creating' },
            { text: 'Permission Flags', link: '/server/transformers/permissions' },
            { text: 'Filtering Data', link: '/server/transformers/filtering' },
            { text: 'Combining Sources', link: '/server/transformers/combining' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Route Structure', link: '/server/route-structure' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Composables Examples',
          items: [
            {
              text: 'Basic',
              collapsed: false,
              items: [
                { text: 'Simple GET', link: '/examples/composables/basic/simple-get' },
                { text: 'Path Parameters', link: '/examples/composables/basic/path-parameters' },
                { text: 'Query Parameters', link: '/examples/composables/basic/query-parameters' },
                { text: 'POST Request', link: '/examples/composables/basic/post-request' },
              ],
            },
            {
              text: 'Callbacks',
              collapsed: true,
              items: [
                { text: 'Success Navigation', link: '/examples/composables/callbacks/success-navigation' },
                { text: 'Error Toast', link: '/examples/composables/callbacks/error-toast' },
                { text: 'Request Logging', link: '/examples/composables/callbacks/request-logging' },
              ],
            },
            {
              text: 'Global Callbacks',
              collapsed: true,
              items: [
                { text: 'Auth Token', link: '/examples/composables/global-callbacks/auth-token' },
                { text: 'Error Handling', link: '/examples/composables/global-callbacks/error-handling' },
                { text: 'Analytics', link: '/examples/composables/global-callbacks/analytics' },
                { text: 'Skip Patterns', link: '/examples/composables/global-callbacks/skip-patterns' },
              ],
            },
            {
              text: 'Advanced',
              collapsed: true,
              items: [
                { text: 'Authentication Flow', link: '/examples/composables/advanced/authentication-flow' },
                { text: 'File Upload', link: '/examples/composables/advanced/file-upload' },
                { text: 'Pagination', link: '/examples/composables/advanced/pagination' },
                { text: 'Caching', link: '/examples/composables/advanced/caching' },
              ],
            },
          ],
        },
        {
          text: 'Server Examples',
          items: [
            {
              text: 'Basic BFF',
              items: [
                { text: 'Simple Route', link: '/examples/server/basic-bff/simple-route' },
                { text: 'With Auth', link: '/examples/server/basic-bff/with-auth' },
              ],
            },
            {
              text: 'Transformers',
              items: [
                { text: 'Add Permissions', link: '/examples/server/transformers/add-permissions' },
                { text: 'Filter Sensitive', link: '/examples/server/transformers/filter-sensitive' },
                { text: 'Combine Sources', link: '/examples/server/transformers/combine-sources' },
              ],
            },
            {
              text: 'Auth Patterns',
              items: [
                { text: 'JWT Verification', link: '/examples/server/auth-patterns/jwt-verification' },
                { text: 'Role-Based', link: '/examples/server/auth-patterns/role-based' },
                { text: 'Session-Based', link: '/examples/server/auth-patterns/session-based' },
              ],
            },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'CLI Commands', link: '/api/cli' },
          ],
        },
        {
          text: 'Interfaces',
          items: [
            { text: 'MethodInfo', link: '/api/interfaces/method-info' },
            { text: 'Request Options', link: '/api/interfaces/request-options' },
            { text: 'Callback Contexts', link: '/api/interfaces/callback-contexts' },
            { text: 'Raw Response', link: '/api/interfaces/raw-response' },
          ],
        },
        {
          text: 'Parser',
          items: [
            { text: 'extractMethodInfo', link: '/api/parser/extract-method-info' },
            { text: 'parseApiFile', link: '/api/parser/parse-api-file' },
            { text: 'scanApiFiles', link: '/api/parser/scan-api-files' },
          ],
        },
        {
          text: 'Runtime',
          items: [
            { text: 'useApiRequest', link: '/api/runtime/use-api-request' },
            { text: 'useApiAsyncData', link: '/api/runtime/use-api-async-data' },
            { text: 'useApiAsyncDataRaw', link: '/api/runtime/use-api-async-data-raw' },
          ],
        },
      ],

      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'System Overview', link: '/architecture/overview' },
          ],
        },
        {
          text: 'Patterns',
          items: [
            { text: 'Two-Stage Generation', link: '/architecture/patterns/two-stage-generation' },
            { text: 'Wrapper Pattern', link: '/architecture/patterns/wrapper-pattern' },
            { text: 'Shared Code', link: '/architecture/patterns/shared-code' },
            { text: 'Template-Based', link: '/architecture/patterns/template-based' },
            { text: 'Copy vs Import', link: '/architecture/patterns/copy-vs-import' },
          ],
        },
        {
          text: 'Design Decisions',
          items: [
            { text: 'ADR-001: ts-morph', link: '/architecture/decisions/adr-001-ts-morph' },
            { text: 'ADR-002: Copy Runtime', link: '/architecture/decisions/adr-002-copy-runtime' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Data Flow', link: '/architecture/data-flow' },
          ],
        },
      ],

      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Overview', link: '/contributing/' },
            { text: 'Setup', link: '/contributing/setup' },
            { text: 'Workflow', link: '/contributing/workflow' },
          ],
        },
        {
          text: 'Adding Features',
          items: [
            { text: 'New Callback', link: '/contributing/adding-features/new-callback' },
            { text: 'New Generator', link: '/contributing/adding-features/new-generator' },
            { text: 'Parser Feature', link: '/contributing/adding-features/parser-feature' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Testing', link: '/contributing/testing' },
            { text: 'Debugging', link: '/contributing/debugging' },
            { text: 'Code Style', link: '/contributing/code-style' },
          ],
        },
      ],

      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Overview', link: '/troubleshooting/' },
            { text: 'Installation', link: '/troubleshooting/installation' },
            { text: 'Generation Errors', link: '/troubleshooting/generation-errors' },
            { text: 'Runtime Errors', link: '/troubleshooting/runtime-errors' },
            { text: 'Type Errors', link: '/troubleshooting/type-errors' },
            { text: 'Callback Issues', link: '/troubleshooting/callback-issues' },
            { text: 'Performance', link: '/troubleshooting/performance' },
            { text: 'OpenAPI Spec', link: '/troubleshooting/openapi-spec' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dmartindiaz' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/dmartindiaz/nuxt-openapi-hyperfetch/',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026-present',
    },
  },
});

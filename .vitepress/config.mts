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
      { text: 'Connectors', link: '/connectors/getting-started' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'What is Nuxt OpenAPI Hyperfetch?', link: '/guide/what-is-nuxt-openapi-hyperfetch' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Use as Nuxt Module', link: '/guide/use-as-nuxt-module' },
            { text: 'Use as CLI', link: '/guide/use-as-cli' },
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
            { text: 'Pagination', link: '/composables/use-async-data/pagination' },
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
            { text: 'Global Headers', link: '/composables/features/global-headers' },
            { text: 'Pick Fields', link: '/composables/features/pick' },
            { text: 'Request Interception', link: '/composables/features/request-interception' },
            { text: 'Authentication', link: '/composables/features/authentication' },
          ],
        },
      ],

      '/server/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/server/' },
            { text: 'Getting Started', link: '/server/getting-started' },
            { text: 'Route Structure', link: '/server/route-structure' },
          ],
        },
        {
          text: 'BFF Mode',
          items: [
            { text: 'BFF Pattern', link: '/server/bff-pattern/' },
            { text: 'Auth Context', link: '/server/auth-context/' },
          ],
        },
        {
          text: 'Transformers',
          items: [
            { text: 'What are Transformers?', link: '/server/transformers/' },
            { text: 'Permission Flags', link: '/server/transformers/permissions' },
            { text: 'Filtering Data', link: '/server/transformers/filtering' },
            { text: 'Combining Sources', link: '/server/transformers/combining' },
          ],
        },
      ],

      '/connectors/': [
        {
          text: 'Connectors',
          items: [
            { text: 'Getting Started', link: '/connectors/getting-started' },
            { text: 'useListConnector', link: '/connectors/use-list-connector' },
            { text: 'useFormConnector', link: '/connectors/use-form-connector' },
            { text: 'useDeleteConnector', link: '/connectors/use-delete-connector' },
            { text: 'Full CRUD Example', link: '/connectors/full-example' },
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
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/dmartindiaz' },
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

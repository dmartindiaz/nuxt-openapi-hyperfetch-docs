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
      { text: 'Connectors', link: '/connectors/' },
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
            { text: 'Overview', link: '/connectors/' },
            { text: 'OpenAPI Conventions', link: '/connectors/openapi-conventions' },
            { text: 'Connector Configuration', link: '/connectors/connector-configuration' },
            { text: 'getAll', link: '/connectors/get-all' },
            { text: 'get', link: '/connectors/get' },
            { text: 'create', link: '/connectors/create' },
            { text: 'update', link: '/connectors/update' },
            { text: 'delete', link: '/connectors/delete' },
            { text: 'Callbacks', link: '/connectors/callbacks' },
          ],
        },
      ],

      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Design Patterns', link: '/architecture/patterns/' },
            { text: 'Architecture Decisions', link: '/architecture/decisions/' },
          ],
        },
        {
          text: 'Patterns',
          items: [
            { text: 'Overview', link: '/architecture/patterns/' },
            { text: 'Client Composables', link: '/architecture/patterns/client-composables' },
            { text: 'Server Composables', link: '/architecture/patterns/server-composables' },
            { text: 'BFF Pattern', link: '/architecture/patterns/bff-pattern' },
            { text: 'Error Handling', link: '/architecture/patterns/error-handling' },
          ],
        },
        {
          text: 'Design Decisions',
          items: [
            { text: 'Overview', link: '/architecture/decisions/' },
            { text: 'ADR 001: useFetch vs useAsyncData', link: '/architecture/decisions/001-useFetch-vs-useAsyncData' },
            { text: 'ADR 002: Callback system', link: '/architecture/decisions/002-callback-system' },
            { text: 'ADR 003: nuxtServer output', link: '/architecture/decisions/003-server-composables' },
            { text: 'ADR 004: Base SDK generation', link: '/architecture/decisions/004-type-generation' },
          ],
        },
      ],

      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Overview', link: '/contributing/' },
            { text: 'Development Setup', link: '/contributing/development' },
            { text: 'Code Style', link: '/contributing/code-style' },
            { text: 'Testing', link: '/contributing/testing' },
            { text: 'Documentation', link: '/contributing/documentation' },
            { text: 'Pull Requests', link: '/contributing/pull-requests' },
            { text: 'Release Process', link: '/contributing/release-process' },
            { text: 'Roadmap', link: '/contributing/roadmap' },
          ],
        },
      ],

      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Overview', link: '/troubleshooting/' },
            { text: 'Build Issues', link: '/troubleshooting/build-issues' },
            { text: 'Generation Errors', link: '/troubleshooting/generation-errors' },
            { text: 'Composables Issues', link: '/troubleshooting/composables-issues' },
            { text: 'Runtime Errors', link: '/troubleshooting/runtime-errors' },
            { text: 'Server Issues', link: '/troubleshooting/server-issues' },
            { text: 'Type Errors', link: '/troubleshooting/type-errors' },
            { text: 'Performance', link: '/troubleshooting/performance' },
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
      pattern: 'https://github.com/dmartindiaz/nuxt-openapi-hyperfetch-docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026-present',
    },

    
  },
});

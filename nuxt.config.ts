export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt',
  ],

  css: ['~/main.css'],

  ssr: false,

  compatibilityDate: '2026-03-24',

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'DisEkplexia',
    },
  },

  devServer: {
    port: 10308,
  },

  fonts: {
    provider: 'bunny',
    providers: {
      google: false,
      googleicons: false,
    },
  },

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: [
      'audio/chime-soft.wav',
      'audio/chime-focus.wav',
      'audio/chime-alert.wav',
      'pwa-icon.svg',
    ],
    manifest: {
      name: 'DisEkplexia',
      short_name: 'DisEkplexia',
      description: 'A PWA for training and reducing over-startle responses with randomized audio drills.',
      theme_color: '#12372a',
      background_color: '#f5f8f1',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/pwa-icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wav}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'workbox-window',
        '@vueuse/core',
      ],
    },
  },
});

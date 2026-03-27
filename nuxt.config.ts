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
      meta: [
        { name: 'description', content: '过度惊跳反应脱敏训练工具' },
      ],
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
      'logo.png',
    ],
    manifest: {
      name: 'DisEkplexia',
      description: '过度惊跳反应脱敏训练工具',
      orientation: 'portrait',
      icons: [{
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      }],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wav}'],
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'workbox-window',
      ],
    },
  },
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-08',

  // CSS configuration
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  // TypeScript configuration
  typescript: {
    typeCheck: true
  },

  // App configuration
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/oaudit/' : '/',
    head: {
      title: 'OAudit',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Vue.js + TypeScript project managed with Nix' }
      ]
    }
  },

  // Build configuration for static generation
  nitro: {
    prerender: {
      routes: ['/']
    }
  },

  // SSG configuration for GitHub Pages
  ssr: false
})

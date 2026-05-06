// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-07',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'reka-ui/nuxt'],
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite-preview',
  },
})

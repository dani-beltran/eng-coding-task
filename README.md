# Coding interview — Nuxt storefront + product assistant

Baseline app for a hands-on interview. **Scope and edge cases are clarified live on the call**; use this README for setup and the core goal only.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** (or use `npm` / `yarn` if you prefer — adjust commands)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment template and add your Gemini API key ([Google AI Studio](https://aistudio.google.com/)):

   ```bash
   cp .env.example .env
   ```

   Set `GEMINI_API_KEY` in `.env`. The key is read as **server-only** runtime config (`runtimeConfig.geminiApiKey` in `nuxt.config.ts`). **Do not** expose it to the client or call Gemini from the browser with this key.

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Optional: confirm Nitro is running:

   ```bash
   curl http://localhost:3000/api/health
   ```

   Expect `{"ok":true}`.

## Stack (already configured)

- [Nuxt 3](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/) (`@nuxtjs/tailwindcss`)
- [Reka UI](https://reka-ui.com/) (`reka-ui` + `reka-ui/nuxt` auto-imports)
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) for Gemini on the **server** (e.g. `server/api/...`)

## Task

Build a **one-page** experience:

1. **Storefront**  
   Load product data from **[DummyJSON — products](https://dummyjson.com/products)** (consider `?limit=` for a predictable payload). Render a storefront-style layout.

2. **Design reference**  
   Match the **layout and visual direction** of this Figma file (duplicate if needed):  
   [Mock Product page](https://www.figma.com/design/9wQgbxJWDt3q8HzQsZtY3a/Mock-Product-page)

3. **Shopping assistant (chat)**  
   Let the user ask questions about the catalog. Answers must come from **Gemini**, with responses **grounded in the product data you fetched** — not generic ecommerce knowledge. Implement the Gemini call from **Nuxt server routes** (`server/api/...`) so the API key never ships to the client.

4. **Grounding rule**  
   If something is **not** in the loaded catalog data, the assistant should say it is not in the catalog (no invented SKUs, prices, or products).

5. **Replace the starter**  
   The default [`pages/index.vue`](pages/index.vue) is a placeholder; replace it with your implementation.

## Chatbot testing (during the interview)

On the call we will **use the assistant like a shopper**: ask about specific products, compare options, probe details that only appear in the JSON (price, availability, descriptions, reviews, policies—whatever you surface in context), and occasionally ask about **things that are not in your loaded catalog**. We are not publishing a fixed script; the goal is to see whether answers **feel consistent with the data you actually have** rather than generic shop talk.

## Acceptance criteria (directional)

These are **guides**, not a rigid checklist—priorities may shift on the call.

- **Catalog + UI:** Products come from DummyJSON; the page reads as a coherent storefront and is **reasonably aligned** with the Figma (exact pixel-perfect match is not required unless agreed live).
- **Assistant:** Chat goes through **your server**; the model is given enough catalog context to answer; replies should **track the dataset** (including saying when something is unknown or not in the catalog).
- **UX:** Obvious states (e.g. loading / failure / empty) are handled in a way you can explain; the flow is usable end-to-end for the demo.
- **Security:** Gemini credentials stay **server-side** only.

We may ask you to **walk through** how context is built, how errors are handled, and what you would tighten with more time.

## Architecture (what you implement)

```mermaid
sequenceDiagram
  participant Browser
  participant NuxtServer
  participant DummyJSON
  participant Gemini

  Browser->>NuxtServer: Fetch products SSR client or API route
  NuxtServer->>DummyJSON: GET /products
  DummyJSON-->>NuxtServer: JSON
  NuxtServer-->>Browser: Product UI

  Browser->>NuxtServer: POST chat message
  NuxtServer->>Gemini: generate with catalog context
  Gemini-->>NuxtServer: text
  NuxtServer-->>Browser: Assistant reply
```

On the server, use `useRuntimeConfig(event)` (or `useRuntimeConfig()` in server context) to read `geminiApiKey` — **only** in server code.

## License

Private / interview use unless otherwise stated by the repository owner.

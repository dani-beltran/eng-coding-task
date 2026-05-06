<script setup lang="ts">
type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

const prompt = ref('')
const isSending = ref(false)
const errorMessage = ref('')
const messages = ref<ChatMessage[]>([])

const submitPrompt = async () => {
  if (!prompt.value.trim() || isSending.value) {
    return
  }

  const userPrompt = prompt.value.trim()
  errorMessage.value = ''
  messages.value.push({ role: 'user', content: userPrompt })
  prompt.value = ''
  isSending.value = true

  try {
    const response = await $fetch<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: { prompt: userPrompt },
    })

    messages.value.push({ role: 'assistant', content: response.reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to get a response right now.'
    errorMessage.value = message
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[520px] flex-col rounded-[24px] border border-zinc-300 bg-zinc-100 text-zinc-900 shadow-sm">
    <div class="flex min-h-0 w-full flex-1 flex-col p-5 pb-0">
      <header class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" class="h-6 w-6 text-blue-500" fill="currentColor" aria-hidden="true">
            <path d="M12 2c1.8 4.4 5.6 8.2 10 10-4.4 1.8-8.2 5.6-10 10-1.8-4.4-5.6-8.2-10-10 4.4-1.8 8.2-5.6 10-10z" />
          </svg>
          <h1 class="text-3xl font-medium tracking-tight">Helper</h1>
        </div>
        <div class="flex items-center gap-4 text-zinc-700">
          <button type="button" class="rounded-md p-1 transition hover:bg-zinc-200/80" aria-label="History">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
              <path d="M12 7v6l4 2" />
            </svg>
          </button>
          <button type="button" class="rounded-md p-1 transition hover:bg-zinc-200/80" aria-label="New chat">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
        </div>
      </header>

      <main class="flex-1 space-y-4 overflow-y-auto pb-5">
        <div class="space-y-1">
          <p class="text-2xl font-semibold text-blue-500">Hello!</p>
          <p class="text-2xl font-medium text-zinc-400">How can I help you today?</p>
        </div>

        <div v-if="messages.length" class="space-y-3 pt-3">
          <article
            v-for="(message, index) in messages"
            :key="`${index}-${message.role}`"
            class="rounded-xl px-4 py-3 text-sm leading-relaxed"
            :class="message.role === 'user' ? 'ml-10 bg-zinc-900 text-white' : 'mr-10 border border-zinc-300 bg-white text-zinc-800'"
          >
            {{ message.content }}
          </article>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {{ errorMessage }}
        </p>
      </main>
    </div>

    <footer class="w-full rounded-b-[24px] border-t border-zinc-300 bg-zinc-100 p-4">
      <form class="space-y-4" @submit.prevent="submitPrompt">
        <div class="rounded-2xl border border-zinc-300 bg-zinc-200/70 px-4 py-3.5">
          <input
            v-model="prompt"
            class="w-full bg-transparent text-lg text-zinc-700 placeholder:text-zinc-500 focus:outline-none"
            placeholder="Enter prompt here"
            :disabled="isSending"
          >
        </div>
        <p class="text-center text-sm text-zinc-600">
          Gemini may make mistakes. Please use with discretion. This will improve over time.
        </p>
      </form>
    </footer>
  </section>
</template>

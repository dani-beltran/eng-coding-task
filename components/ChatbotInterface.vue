<script setup lang="ts">
import sparkIcon from '~/assets/icons/spark.svg'
type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
  sources?: string[]
}

const prompt = ref('')
const isSending = ref(false)
const errorMessage = ref('')
const messages = ref<ChatMessage[]>([])
const lastSubmittedPrompt = ref('')

const sendPrompt = async (rawPrompt: string) => {
  const userPrompt = rawPrompt.trim()
  if (!userPrompt || isSending.value) {
    return
  }

  errorMessage.value = ''
  lastSubmittedPrompt.value = userPrompt
  messages.value.push({ role: 'user', content: userPrompt })
  prompt.value = ''
  isSending.value = true

  try {
    const response = await $fetch<{ reply: string, sources: string[] }>('/api/chat', {
      method: 'POST',
      body: {
        prompt: userPrompt,
        history: messages.value.slice(-10).map(message => ({
          role: message.role,
          content: message.content,
        })),
      },
    })

    messages.value.push({ role: 'assistant', content: response.reply, sources: response.sources })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to get a response right now.'
    errorMessage.value = message
  } finally {
    isSending.value = false
  }
}

const submitPrompt = async () => {
  await sendPrompt(prompt.value)
}

const retryLastPrompt = async () => {
  await sendPrompt(lastSubmittedPrompt.value)
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-[520px] flex-col rounded-[24px] border border-zinc-300 bg-zinc-100 text-zinc-900 shadow-sm">
    <div class="flex min-h-0 w-full flex-1 flex-col p-5 pb-0">
      <header class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <img :src="sparkIcon" alt="Helper icon" class="h-6 w-6">
          <h1 class="text-xl font-medium tracking-tight">Helper</h1>
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
          <p class="bg-gradient-to-r from-0% from-blue-500 to-40% to-fuchsia-400 bg-clip-text text-xl font-semibold text-transparent">Hello!</p>
          <p class="text-xl font-medium text-zinc-400">How can I help you today?</p>
        </div>

        <div v-if="messages.length" class="space-y-3 pt-3">
          <article
            v-for="(message, index) in messages"
            :key="`${index}-${message.role}`"
            class="rounded-xl px-4 py-3 text-sm leading-relaxed"
            :class="message.role === 'user' ? 'ml-10 bg-zinc-900 text-white' : 'mr-10 border border-zinc-300 bg-white text-zinc-800'"
          >
            {{ message.content }}
            <div v-if="message.sources && message.sources.length" class="mt-2">
              <span class="text-zinc-500">Product references:</span>
              <ul  class="list-disc list-inside text-xs text-zinc-500">
                <li v-for="(source, sourceIndex) in message.sources" :key="sourceIndex">{{ source }}</li>
              </ul>
            </div>
          </article>
        </div>

        <article
          v-if="isSending"
          class="mr-10 flex items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700"
          aria-live="polite"
        >
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Generating response...</span>
        </article>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Something went wrong!
          <button
            v-if="lastSubmittedPrompt"
            type="button"
            class="mt-2 block text-sm font-semibold text-rose-700 underline"
            @click="retryLastPrompt"
          >
            Try again
          </button>
        </p>
      </main>
    </div>

    <footer class="w-full rounded-b-[24px] border-t border-zinc-300 bg-zinc-100 p-4">
      <form class="space-y-4" @submit.prevent="submitPrompt">
        <div class="rounded-2xl border border-zinc-300 bg-zinc-200/70 px-4 py-3.5">
          <input
            v-model="prompt"
            class="w-full bg-transparent text-base text-zinc-700 placeholder:text-zinc-500 focus:outline-none"
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

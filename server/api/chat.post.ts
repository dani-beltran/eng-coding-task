import { GeminiService } from '../services/gemini.service'

type ChatRequest = {
  prompt?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequest>(event)
  const gemini = new GeminiService(event)
  const reply = await gemini.prompt(body.prompt ?? '')

  return { reply }
})

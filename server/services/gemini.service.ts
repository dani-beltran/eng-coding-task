import type { H3Event } from 'h3'
import { GoogleGenerativeAI } from '@google/generative-ai'

type PromptGeminiOptions = {
  model?: string
  systemInstruction?: string
}

const DEFAULT_MODEL = 'gemini-2.5-flash'

export const promptGemini = async (
  prompt: string,
  options: PromptGeminiOptions = {},
  event?: H3Event,
) => {
  if (!prompt.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required',
    })
  }

  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  const apiKey = config.geminiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key is not configured',
    })
  }

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({
    model: options.model ?? DEFAULT_MODEL,
    systemInstruction: options.systemInstruction,
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

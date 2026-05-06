import type { H3Event } from "h3";
import { GoogleGenerativeAI } from "@google/generative-ai";

type PromptGeminiOptions = {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
};

const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";
const geminiClientsByApiKey = new Map<string, GoogleGenerativeAI>();

export class GeminiService {
  private readonly client: GoogleGenerativeAI;

  constructor(event?: H3Event) {
    const config = event ? useRuntimeConfig(event) : useRuntimeConfig();
    const apiKey = config.geminiApiKey;

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Gemini API key is not configured",
      });
    }

    let client = geminiClientsByApiKey.get(apiKey);
    if (!client) {
      client = new GoogleGenerativeAI(apiKey);
      geminiClientsByApiKey.set(apiKey, client);
    }

    this.client = client;
  }

  async prompt(prompt: string, options: PromptGeminiOptions = {}) {
    if (!prompt.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Prompt is required",
      });
    }

    try {
      const model = this.client.getGenerativeModel({
        model: options.model ?? DEFAULT_MODEL,
        systemInstruction: options.systemInstruction,
        generationConfig: {
          temperature: options.temperature,
          responseMimeType: options.responseMimeType,
        },
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to generate a response",
        data: error,
      });
    }
  }
}

import { GeminiService } from '../services/gemini.service'
import { fetchCatalog } from '../services/catalog.service'
import { z, type ZodIssue } from 'zod'

type GroundingProduct = {
  id: number
  title: string
  description: string
  price: number
  brand: string | null
  sku: string | null
  availabilityStatus: string | null
  stock: number | null
  tags: string[]
  category: string | null
  rating: number | null
  discountPercentage: number | null
  shippingInformation: string | null
  warrantyInformation: string | null
  returnPolicy: string | null
  reviews: Array<{
    rating: number | null
    comment: string
  }>
}

const MAX_HISTORY_MESSAGES = 10
const MAX_PROMPT_LENGTH = 20_000
const MAX_HISTORY_MESSAGE_LENGTH = 20_000
const FIXED_NOT_IN_CATALOG_REPLY = 'We are sorry, but that information is not in our product catalog. Please let us know if there is anything else we can assist you with.'

type ValidatedChatRequest = z.infer<typeof chatRequestSchema>

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_HISTORY_MESSAGE_LENGTH),
})

const chatRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(MAX_PROMPT_LENGTH),
  history: z.array(historyMessageSchema).max(MAX_HISTORY_MESSAGES).optional().default([]),
})

const validateChatRequest = (body: unknown): ValidatedChatRequest => {
  const parsed = chatRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
      data: parsed.error.issues.map((issue: ZodIssue) => issue.message).join('; '),
    })
  }

  return parsed.data
}

/**
 * Converts an array of raw product objects into an array of GroundingProduct objects.
 * This function ensures that each product has the expected fields with the correct types, so
 * that the resulting array can be safely used as grounding context for the Gemini model without 
 * risking malformed data causing issues in the prompt and avoiding leaking sensitive information like emails. 
 */
const toGroundingProducts = (products: Array<Record<string, unknown>>): GroundingProduct[] => {
  return products.map(product => ({
    id: typeof product.id === 'number' ? product.id : Number(product.id),
    title: typeof product.title === 'string' ? product.title : '',
    description: typeof product.description === 'string' ? product.description : '',
    price: typeof product.price === 'number' ? product.price : Number(product.price),
    brand: typeof product.brand === 'string' ? product.brand : null,
    sku: typeof product.sku === 'string' ? product.sku : null,
    availabilityStatus: typeof product.availabilityStatus === 'string' ? product.availabilityStatus : null,
    stock: typeof product.stock === 'number' ? product.stock : null,
    tags: Array.isArray(product.tags) ? product.tags.filter(tag => typeof tag === 'string') : [],
    category: typeof product.category === 'string' ? product.category : null,
    rating: typeof product.rating === 'number' ? product.rating : null,
    discountPercentage: typeof product.discountPercentage === 'number' ? product.discountPercentage : null,
    shippingInformation: typeof product.shippingInformation === 'string' ? product.shippingInformation : null,
    warrantyInformation: typeof product.warrantyInformation === 'string' ? product.warrantyInformation : null,
    returnPolicy: typeof product.returnPolicy === 'string' ? product.returnPolicy : null,
    // Stripping out user emails and names from reviews to avoid leaking personally identifiable information.
    reviews: Array.isArray(product.reviews) ? product.reviews.map(review => ({
      rating: typeof review.rating === 'number' ? review.rating : null,
      comment: typeof review.comment === 'string' ? review.comment : '',
    })) : [],
  }))
}

const parseJsonReply = (text: string) => {
  const parsed = JSON.parse(text) as {
    answer?: unknown
    sources?: unknown
  }

  if (typeof parsed.answer !== 'string') {
    throw new Error('Invalid Gemini answer format')
  }

  const sources = Array.isArray(parsed.sources)
    ? parsed.sources.filter(source => typeof source === 'string').map(source => source.trim()).filter(Boolean)
    : []

  return {
    answer: parsed.answer.trim(),
    sources,
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<unknown>(event)
  const validated = validateChatRequest(body)

  try {
    const { prompt, history } = validated
    const config = useRuntimeConfig(event)
    // Fetching the whole catalog on every request is not ideal for performance, but it ensures the data is always up to date,
    // specially the availability status, which is important for the user experience and can change frequently. 
    const catalog = await fetchCatalog()
    const groundingProducts = toGroundingProducts(catalog.products)

    const catalogContext = JSON.stringify(groundingProducts)
    const historyContext = history.map(message => `${message.role}: ${message.content}`).join('\n')
    const geminiPrompt = [
      'CATALOG:',
      catalogContext,
      '',
      historyContext ? 'CONVERSATION_HISTORY:' : '',
      historyContext,
      '',
      `USER_QUESTION: ${prompt}`,
      '',
      'Reply ONLY with valid JSON: {"answer":"...","sources":["SKU-1","SKU-2"]}.',
      `If requested information does not exist in CATALOG, answer must be exactly "${FIXED_NOT_IN_CATALOG_REPLY}" and sources must be an empty array.`,
      'Never invent products, SKUs, prices, or fields not present in CATALOG.',
    ].filter(Boolean).join('\n')

    const gemini = new GeminiService(event)
    const rawReply = await gemini.prompt(geminiPrompt, {
      model: typeof config.geminiModel === 'string' ? config.geminiModel : undefined,
      temperature: 0.2,
      responseMimeType: 'application/json',
      systemInstruction: [
        'You are a catalog-grounded shopping assistant.',
        'Use only provided catalog data.',
        `When data is missing, answer exactly "${FIXED_NOT_IN_CATALOG_REPLY}".`,
        'Always include only real SKU values from the provided catalog in sources.',
      ].join(' '),
    })

    const parsed = parseJsonReply(rawReply)

    return {
      reply: parsed.answer,
      sources: parsed.sources,
    }
  } catch (error) {
    // We log the error for debugging purposes, but we return a generic error message to 
    // the client to avoid exposing sensitive information or implementation details.
    console.error('Chat API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating response from Chat Assistant',
    })
  }
})

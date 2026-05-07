import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startNuxtServer, type StartedNuxtServer } from '../_nuxt-server'

describe('POST /api/chat validation', () => {
  let server: StartedNuxtServer

  beforeAll(async () => {
    server = await startNuxtServer({
      port: 3203,
      env: { GEMINI_API_KEY: 'test-key' },
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 400 for prompts longer than the max length', async () => {
    const response = await fetch(`${server.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'a'.repeat(20_001) }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.statusMessage).toBe('Invalid request body')
    expect(body.data).toBe('Too big: expected string to have <=20000 characters')
  })

  it('returns 400 for history messages longer than the max length', async () => {
    const response = await fetch(`${server.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Suggest a laptop',
        history: [{ role: 'user', content: 'a'.repeat(20_001) }],
      }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.statusMessage).toBe('Invalid request body')
    expect(body.data).toBe('Too big: expected string to have <=20000 characters')
  })
})

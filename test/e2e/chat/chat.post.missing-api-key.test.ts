import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startNuxtServer, type StartedNuxtServer } from '../_nuxt-server'

describe('POST /api/chat without GEMINI_API_KEY', () => {
  let server: StartedNuxtServer

  beforeAll(async () => {
    server = await startNuxtServer({
      port: 3201,
      env: { GEMINI_API_KEY: '' },
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 500 when API key is missing', async () => {
    const response = await fetch(`${server.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Suggest a cheap laptop' }),
    })

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.statusMessage).toBe('Gemini API key is not configured')
  })
})

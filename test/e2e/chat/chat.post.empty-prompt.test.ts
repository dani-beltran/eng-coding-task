import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startNuxtServer, type StartedNuxtServer } from '../_nuxt-server'

describe('POST /api/chat with empty prompt', () => {
  let server: StartedNuxtServer

  beforeAll(async () => {
    server = await startNuxtServer({
      port: 3202,
      env: { GEMINI_API_KEY: 'test-key' },
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 400 for blank prompt', async () => {
    const response = await fetch(`${server.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ prompt: '   ' }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.statusMessage).toBe('Prompt is required')
  })
})

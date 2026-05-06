import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

export type StartedNuxtServer = {
  baseUrl: string
  stop: () => Promise<void>
}

type StartNuxtServerOptions = {
  port: number
  env?: NodeJS.ProcessEnv
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(currentDir, '../..')
const baseEnv = {
  ...process.env,
  NUXT_TELEMETRY_DISABLED: '1',
}

const waitForServer = async (port: number) => {
  const deadline = Date.now() + 45_000
  const healthUrl = `http://127.0.0.1:${port}/api/health`

  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl)
      if (response.ok) {
        return
      }
    } catch {
      // Server is still starting.
    }

    await delay(500)
  }

  throw new Error(`Nuxt dev server did not start on port ${port}`)
}

export const startNuxtServer = async ({
  port,
  env = {},
}: StartNuxtServerOptions): Promise<StartedNuxtServer> => {
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--port', String(port), '--host', '127.0.0.1'],
    {
      cwd: projectRoot,
      env: { ...baseEnv, ...env },
      stdio: 'pipe',
    },
  )

  await waitForServer(port)

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    stop: async () => {
      if (child.killed) {
        return
      }

      child.kill('SIGTERM')
      await Promise.race([
        new Promise<void>((resolveExit) => {
          child.once('exit', () => resolveExit())
        }),
        delay(5_000).then(() => {
          if (!child.killed) {
            child.kill('SIGKILL')
          }
        }),
      ])
    },
  }
}

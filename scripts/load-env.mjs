#!/usr/bin/env node
/**
 * Load env files for scripts.
 *
 * - Default: `.env` then `.env.remote` fill-ins (remote does not override local)
 * - target "remote" / "prod": `.env` then `.env.remote` with remote winning
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {}
  }

  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...rest] = trimmed.split('=')
    env[key.trim()] = rest.join('=').replace(/^["']|["']$/g, '')
  }

  return env
}

export function applyEnv(vars, { override = false } = {}) {
  for (const [key, value] of Object.entries(vars)) {
    if (override || process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/**
 * @param {'local' | 'remote'} target
 */
export function loadEnv(target = 'local') {
  applyEnv(parseEnvFile(resolve('.env')), { override: false })

  if (target === 'remote') {
    applyEnv(parseEnvFile(resolve('.env.remote')), { override: true })
  } else {
    applyEnv(parseEnvFile(resolve('.env.remote')), { override: false })
  }

  return target
}

export function resolveSeedTarget(argv = process.argv.slice(2)) {
  if (argv.includes('--remote') || argv.includes('--prod')) {
    return 'remote'
  }

  const fromEnv = (process.env.SEED_TARGET || '').toLowerCase()
  if (fromEnv === 'remote' || fromEnv === 'prod' || fromEnv === 'production') {
    return 'remote'
  }

  return 'local'
}

export function getProjectRef(supabaseUrl = process.env.SUPABASE_URL || '') {
  return (
    process.env.PROJECT_REF
    || (supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/) || [])[1]
    || null
  )
}

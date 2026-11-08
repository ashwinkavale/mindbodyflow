import type { AppState } from '../types'

/** Read-only access to data written by the pre-Supabase version of the app, so it can be imported once. */
const KEY = 'rts-tracker:v1'

export function readLegacyState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AppState) : null
  } catch { return null }
}

export function clearLegacyState() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
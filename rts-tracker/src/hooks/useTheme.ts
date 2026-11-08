import { useSyncExternalStore } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
const KEY = 'rts-theme'
const mq = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

const stored = (): ThemeMode => {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system' } catch { return 'system' }
}
let mode = stored()
let snapshot = ''

function apply() {
  const dark = mode === 'dark' || (mode === 'system' && mq.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  snapshot = `${mode}:${dark}`
  listeners.forEach((l) => l())
}

export function initTheme() {
  apply()
  mq.addEventListener('change', () => mode === 'system' && apply())
}

export function setTheme(next: ThemeMode) {
  mode = next
  try { next === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, next) } catch { /* private mode: theme lasts for the session */ }
  apply()
}

export function useTheme() {
  const snap = useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => snapshot)
  const [m, dark] = snap.split(':')
  return { mode: m as ThemeMode, dark: dark === 'true', setMode: setTheme }
}

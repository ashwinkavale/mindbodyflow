import { useState } from 'react'
import { useApp } from '../../app/store'
import type { HealthMetric } from '../../types'

type Key = 'sleepHours' | 'restingHr' | 'steps' | 'weightKg'
const FIELDS: { key: Key; label: string }[] = [
  { key: 'sleepHours', label: 'Sleep (hours)' }, { key: 'restingHr', label: 'Resting heart rate (bpm)' },
  { key: 'steps', label: 'Steps' }, { key: 'weightKg', label: 'Weight (kg)' },
]

export function HealthMetrics() {
  const { state, addHealth, notify } = useApp()
  const [v, setV] = useState<Partial<Record<Key, string>>>({})
  const latest = [...state.health].sort((a, b) => b.date.localeCompare(a.date))[0]
  const h = state.profile?.heightCm
  const bmi = latest?.weightKg && h ? latest.weightKg / (h / 100) ** 2 : null

  const save = () => {
    const m: Partial<HealthMetric> = {}
    FIELDS.forEach(({ key }) => { const n = parseFloat(v[key] ?? ''); if (!Number.isNaN(n) && n > 0) m[key] = n })
    if (!Object.keys(m).length) return
    addHealth(m); setV({}); notify('Health metrics saved')
  }
  return (
    <details className="card">
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Health metrics <span className="mute">optional</span></summary>
      <div className="stack" style={{ marginTop: 14 }}>
        <div className="grid2">{FIELDS.map(({ key, label }) => (
          <label className="field" key={key}><span className="field-label">{label}</span>
            <input className="input" type="number" min={0} step="any" inputMode="decimal" value={v[key] ?? ''} placeholder={latest?.[key] ? `Last: ${latest[key]}` : ''}
              onChange={(e) => setV((p) => ({ ...p, [key]: e.target.value }))} /></label>))}</div>
        {bmi && <p className="mute">BMI {bmi.toFixed(1)}, from your latest weight and the height in Settings.</p>}
        <div><button className="btn ghost" onClick={save}>Save today's metrics</button></div>
      </div>
    </details>
  )
}

import { useState } from 'react'
import { useApp } from '../../app/store'
import { DURATION, PLAN_TYPES } from '../../lib/options'
import type { PlanDay, PlanType, WeekPlan } from '../../types'
import { addDays, fmt, today, weekStart } from '../../utils/date'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const fit = (days?: PlanDay[]): PlanDay[] => Array.from({ length: 7 }, (_, i) => days?.[i] ?? { note: '' })

export function WeekPlanCard() {
  const { state, saveWeekPlan, notify } = useApp()
  const week = addDays(weekStart(today()), 7)
  const saved = state.plans[week]
  const target = state.profile?.weeklyTarget
  const [focus, setFocus] = useState(saved?.focus ?? '')
  const [days, setDays] = useState(() => fit(saved?.days))
  const [dirty, setDirty] = useState(false)
  const planned = days.filter((d) => d.type && d.type !== 'rest').length

  const patch = (i: number, p: Partial<PlanDay>) => { setDays((all) => all.map((d, j) => (j === i ? { ...d, ...p } : d))); setDirty(true) }
  const setType = (i: number, v: string) => {
    const type = (v || undefined) as PlanType | undefined
    patch(i, { type, duration: type && type !== 'rest' ? days[i].duration : undefined })
  }
  const save = () => {
    const plan: WeekPlan = { weekStart: week, focus: focus.trim(), days: days.map((d) => ({ ...d, note: d.note.trim() })) }
    saveWeekPlan(plan)
    setDirty(false)
    notify('Next week’s plan saved')
  }

  return (
    <section className="card stack">
      <div>
        <h2>Next week’s plan</h2>
        <p className="mute">{fmt(week)} – {fmt(addDays(week, 6))} · {planned}{target ? ` of ${target}` : ''} sessions planned</p>
      </div>
      <label className="field"><span className="field-label">Focus for the week <span className="mute">optional</span></span>
        <input className="input" value={focus} maxLength={200} placeholder="e.g. Smooth out heart circle flow"
          onChange={(e) => { setFocus(e.target.value); setDirty(true) }} /></label>
      <div className="stack" style={{ gap: 10 }}>
        {days.map((d, i) => (
          <div className="plan-row" key={DAYS[i]}>
            <span className="plan-day"><b>{DAYS[i]}</b><span className="mute">{fmt(addDays(week, i))}</span></span>
            <select className="input" aria-label={`${DAYS[i]} session`} value={d.type ?? ''} onChange={(e) => setType(i, e.target.value)}>
              <option value="">Not planned</option>
              {PLAN_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="input" aria-label={`${DAYS[i]} duration`} value={d.duration ?? ''} disabled={!d.type || d.type === 'rest'}
              onChange={(e) => patch(i, { duration: (e.target.value || undefined) as PlanDay['duration'] })}>
              <option value="">Duration</option>
              {DURATION.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input className="input note" aria-label={`${DAYS[i]} note`} value={d.note} maxLength={120} placeholder="Focus or note"
              onChange={(e) => patch(i, { note: e.target.value })} />
          </div>
        ))}
      </div>
      <button className="btn" disabled={!dirty} onClick={save}>{saved ? 'Update plan' : 'Save plan'}</button>
    </section>
  )
}
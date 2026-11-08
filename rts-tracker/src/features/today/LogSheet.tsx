import { useEffect, useState } from 'react'
import type { TrainingSession } from '../../types'
import { DURATION, EFFORT, ENERGY, MOVEMENT, PAIN, RECOVERY, STATUS, TRAINING_TYPES } from '../../lib/options'
import { Segmented, Sheet } from '../../components/ui'

type Draft = Omit<TrainingSession, 'id' | 'userId' | 'createdAt'>

export function LogSheet({ date, existing, onSave, onClose }: {
  date: string; existing?: TrainingSession; onSave: (d: Draft) => void; onClose: () => void
}) {
  const [d, setD] = useState<Partial<Draft>>(existing ?? { painLevel: 'none' })
  const [dirty, setDirty] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setD((p) => ({ ...p, [k]: v })); setDirty(true) }

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const active = d.status === 'completed' || d.status === 'partial'
  const hasPain = !!d.painLevel && d.painLevel !== 'none'
  const valid = !!d.status && (!active || (d.trainingType && d.duration && d.effort))
  const close = () => { if (!dirty || window.confirm('Discard this log?')) onClose() }

  const save = () => {
    if (!valid || !d.status) return
    const base = { date, status: d.status, highlight: d.highlight?.trim() || undefined }
    onSave(active
      ? { ...base, trainingType: d.trainingType, duration: d.duration, effort: d.effort, energy: d.energy, movement: d.movement, recovery: d.recovery, painLevel: d.painLevel ?? 'none', painLocation: hasPain ? d.painLocation?.trim() : undefined }
      : base)
  }

  return (
    <Sheet title="Log training" onClose={close}>
      <div className="stack">
        <Segmented label="How did today go?" value={d.status} options={STATUS} onChange={(v) => set('status', v)} />
        {active && (
          <>
            <Segmented label="What did you train?" value={d.trainingType} options={TRAINING_TYPES} onChange={(v) => set('trainingType', v)} />
            <Segmented label="Duration" value={d.duration} options={DURATION} onChange={(v) => set('duration', v)} />
            <Segmented label="Effort" value={d.effort} options={EFFORT} onChange={(v) => set('effort', v)} />
            <details className="card" open={!!(d.energy || d.movement || d.recovery)}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How did you feel? <span className="mute">optional</span></summary>
              <div className="stack" style={{ marginTop: 14 }}>
                <Segmented label="Energy" value={d.energy} options={ENERGY} onChange={(v) => set('energy', v)} />
                <Segmented label="Movement" value={d.movement} options={MOVEMENT} onChange={(v) => set('movement', v)} />
                <Segmented label="Recovery" value={d.recovery} options={RECOVERY} onChange={(v) => set('recovery', v)} />
                <Segmented label="Pain or discomfort" value={d.painLevel} options={PAIN} onChange={(v) => set('painLevel', v)} />
                {hasPain && (
                  <label className="field"><span className="field-label">Where did you feel it?</span>
                    <input className="input" value={d.painLocation ?? ''} onChange={(e) => set('painLocation', e.target.value)} /></label>
                )}
              </div>
            </details>
          </>
        )}
        <label className="field"><span className="field-label">Highlight of the day</span>
          <textarea className="input" value={d.highlight ?? ''} onChange={(e) => set('highlight', e.target.value)} placeholder="Anything worth remembering" /></label>
        <button className="btn" disabled={!valid} onClick={save}>Save log</button>
      </div>
    </Sheet>
  )
}

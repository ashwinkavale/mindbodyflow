import { useState } from 'react'
import type { Challenge, ChallengeCategory, ChallengeInput } from '../../types'
import { CHALLENGE_CATEGORIES, challengeTitle, withTarget } from '../../lib/options'
import { exercisesFor } from '../../data/exercises'
import { Segmented, Sheet } from '../../components/ui'

const LEVELS = [{ value: '1', label: 'Level 1' }, { value: '2', label: 'Level 2' }, { value: '3', label: 'Level 3' }]
const show = (n?: number) => (n === undefined ? '' : String(n))
const toNum = (s: string) => (s.trim() === '' ? undefined : Number(s))

export function ChallengeSheet({ initial, onSave, onClose }: { initial?: Challenge; onSave: (c: ChallengeInput) => void; onClose: () => void }) {
  const [category, setCategory] = useState<ChallengeCategory>(initial?.category ?? 'indian-clubs')
  const [exercise, setExercise] = useState(initial?.exercise ?? '')
  const [reps, setReps] = useState(show(initial?.reps))
  const [weight, setWeight] = useState(show(initial?.weightKg))
  const [time, setTime] = useState(show(initial?.timeMin))
  const [name, setName] = useState(initial?.name ?? '')
  const [level, setLevel] = useState(String(initial?.level ?? 1))
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const touch = <T,>(set: (v: T) => void) => (v: T) => { set(v); setDirty(true) }

  const spec = { exercise: exercise.trim(), reps: toNum(reps), timeMin: toNum(time), weightKg: toNum(weight) }
  const autoName = spec.exercise ? challengeTitle(spec) : ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!spec.exercise) next.exercise = 'Choose or type an exercise'
    else if (spec.exercise.length > 60) next.exercise = 'Keep the exercise name under 60 characters'
    if (spec.reps !== undefined && (!Number.isInteger(spec.reps) || spec.reps < 1 || spec.reps > 1_000_000)) next.reps = 'Enter a whole number of 1 or more'
    if (spec.timeMin !== undefined && !(spec.timeMin > 0 && spec.timeMin <= 10_000)) next.time = 'Enter minutes above 0'
    if (spec.weightKg !== undefined && !(spec.weightKg > 0 && spec.weightKg <= 1000)) next.weight = 'Enter a weight above 0'
    if (spec.reps === undefined && spec.timeMin === undefined && !next.reps && !next.time) next.reps = 'Set reps, a time, or both'
    if (name.trim().length > 80) next.name = 'Keep the name under 80 characters'
    if (description.length > 500) next.description = 'Keep the description under 500 characters'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ ...withTarget(spec), name: name.trim() || challengeTitle(spec), category, level: Number(level) as 1 | 2 | 3, description: description.trim() })
  }
  const close = () => { if (!dirty || window.confirm('Discard this challenge?')) onClose() }

  return (
    <Sheet title={initial ? 'Edit challenge' : 'New challenge'} onClose={close}>
      <form className="stack" onSubmit={submit} noValidate>
        <Segmented label="Category" value={category} options={CHALLENGE_CATEGORIES} onChange={touch(setCategory)} />
        <label className="field"><span className="field-label">Exercise</span>
          <input className="input" list="challenge-exercises" value={exercise} maxLength={60} placeholder="Pick a suggestion or type your own"
            onChange={(e) => touch(setExercise)(e.target.value)} aria-invalid={!!errors.exercise} />
          <datalist id="challenge-exercises">{exercisesFor(category).map((x) => <option key={x} value={x} />)}</datalist>
          {errors.exercise && <span className="err">{errors.exercise}</span>}</label>
        <div className="row" style={{ alignItems: 'start' }}>
          <label className="field grow"><span className="field-label">Reps</span>
            <input className="input" type="number" inputMode="numeric" min={1} step={1} value={reps} onChange={(e) => touch(setReps)(e.target.value)} aria-invalid={!!errors.reps} />
            {errors.reps && <span className="err">{errors.reps}</span>}</label>
          <label className="field grow"><span className="field-label">Weight (kg)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step="any" value={weight} onChange={(e) => touch(setWeight)(e.target.value)} aria-invalid={!!errors.weight} />
            {errors.weight && <span className="err">{errors.weight}</span>}</label>
          <label className="field grow"><span className="field-label">Time (min)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step="any" value={time} onChange={(e) => touch(setTime)(e.target.value)} aria-invalid={!!errors.time} />
            {errors.time && <span className="err">{errors.time}</span>}</label>
        </div>
        <p className="mute">Progress is counted in reps, or in minutes when there are no reps. Weight and time are part of the challenge, not extra things to log.</p>
        <label className="field"><span className="field-label">Name <span className="mute">optional</span></span>
          <input className="input" value={name} maxLength={80} placeholder={autoName || 'Built from the details above'} onChange={(e) => touch(setName)(e.target.value)} aria-invalid={!!errors.name} />
          {errors.name && <span className="err">{errors.name}</span>}</label>
        <Segmented label="Level" value={level} options={LEVELS} onChange={touch(setLevel)} />
        <label className="field"><span className="field-label">Description <span className="mute">optional</span></span>
          <textarea className="input" value={description} maxLength={500} onChange={(e) => touch(setDescription)(e.target.value)} />
          {errors.description && <span className="err">{errors.description}</span>}</label>
        <button className="btn" type="submit">{initial ? 'Save changes' : 'Create challenge'}</button>
      </form>
    </Sheet>
  )
}
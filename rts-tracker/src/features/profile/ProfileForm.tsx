import { useState } from 'react'
import { z } from 'zod'
import type { Goal, User } from '../../types'
import { GENDERS, GOALS, TOOLS } from '../../lib/options'
import { Segmented } from '../../components/ui'
import { today } from '../../utils/date'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  mobile: z.string().trim().regex(/^\+?[\d\s-]{7,16}$/, 'Enter a valid mobile number'),
  // TODO: date of birth is optional here. Before production, confirm the privacy and age-related
  // requirements that apply to the markets you serve and adjust collection and consent accordingly.
  dob: z.string().refine((v) => !v || v <= today(), 'Date of birth cannot be in the future').optional(),
  city: z.string().trim().min(1, 'Enter your city'),
  goals: z.array(z.string()).min(1, 'Pick at least one goal'),
  weeklyTarget: z.number().int().min(1).max(7),
})

type Draft = Omit<User, 'id'>
const blank: Draft = { name: '', email: '', mobile: '', dob: '', gender: 'undisclosed', city: '', goals: [], program: 'indian-clubs', weeklyTarget: 5 }

export function ProfileForm({ initial, submitLabel, onSave, lockedEmail }: { initial?: User | null; submitLabel: string; onSave: (u: Draft) => void; lockedEmail?: string }) {
  const [d, setD] = useState<Draft>(initial ?? { ...blank, email: lockedEmail ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  const photo = (f?: File) => {
    if (!f) return
    if (f.size > 500_000) return setErrors((e) => ({ ...e, photo: 'Choose an image under 500 KB' }))
    const r = new FileReader()
    r.onload = () => { set('photo', String(r.result)); setErrors((e) => ({ ...e, photo: '' })) }
    r.readAsDataURL(f)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = schema.safeParse(d)
    if (!res.success) {
      setErrors(Object.fromEntries(res.error.issues.map((i) => [String(i.path[0]), i.message])))
      return
    }
    onSave(lockedEmail ? { ...d, email: lockedEmail } : d)
  }
  const text = (k: 'name' | 'email' | 'mobile' | 'city', label: string, type = 'text') => (
    <label className="field"><span className="field-label">{label}</span>
      <input className="input" type={type} value={k === 'email' && lockedEmail ? lockedEmail : d[k]} disabled={k === 'email' && !!lockedEmail} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
      {errors[k] && <span className="err">{errors[k]}</span>}</label>
  )

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="row">
        {d.photo ? <img className="avatar" src={d.photo} alt="Profile" /> : <div className="avatar">{d.name.slice(0, 1).toUpperCase() || '·'}</div>}
        <label className="btn ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>Upload photo
          <input type="file" accept="image/*" hidden onChange={(e) => photo(e.target.files?.[0])} /></label>
        {errors.photo && <span className="err">{errors.photo}</span>}
      </div>
      <div className="grid2">{text('name', 'Name')}{text('city', 'City')}{text('email', 'Email', 'email')}{text('mobile', 'Mobile', 'tel')}</div>
      <div className="grid2">
        <label className="field"><span className="field-label">Date of birth (optional)</span>
          <input className="input" type="date" max={today()} value={d.dob ?? ''} onChange={(e) => set('dob', e.target.value)} />
          {errors.dob && <span className="err">{errors.dob}</span>}</label>
        <Segmented label="Gender" value={d.gender} options={GENDERS} onChange={(v) => set('gender', v)} />
      </div>
      <div className="field"><span className="field-label">Primary goals</span>
        <div className="chips">{GOALS.map((g) => {
          const on = d.goals.includes(g.value)
          return <button type="button" key={g.value} aria-pressed={on} className={'chip' + (on ? ' on' : '')}
            onClick={() => set('goals', on ? d.goals.filter((x) => x !== g.value) : [...d.goals, g.value as Goal])}>{g.label}</button>
        })}</div>{errors.goals && <span className="err">{errors.goals}</span>}</div>
      <Segmented label="RTS program" value={d.program} options={TOOLS} onChange={(v) => set('program', v)} />
      <label className="field"><span className="field-label">Sessions per week you're aiming for</span>
        <input className="input" type="number" min={1} max={7} style={{ maxWidth: 120 }} value={d.weeklyTarget}
          onChange={(e) => set('weeklyTarget', Number(e.target.value))} /></label>
      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  )
}
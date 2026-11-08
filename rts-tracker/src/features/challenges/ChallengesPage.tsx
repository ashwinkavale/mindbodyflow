import { useState } from 'react'
import { useApp } from '../../app/store'
import { Bar, Empty, PageHead, Segmented } from '../../components/ui'
import { CHALLENGES } from '../../data/seed'
import { CHALLENGE_CATEGORIES, challengeSpec, label } from '../../lib/options'
import { calculateChallengeProgress } from '../../utils/calc'
import { fmt } from '../../utils/date'
import type { Challenge, ChallengeCategory } from '../../types'
import { ChallengeSheet } from './ChallengeSheet'

const LEVELS = { 1: 'Level 1', 2: 'Level 2', 3: 'Level 3' }
const STATUS = { available: 'Available', accepted: 'Accepted', 'in-progress': 'In progress', completed: 'Completed' }

function ChallengeCard({ c, onEdit }: { c: Challenge; onEdit: () => void }) {
  const { state, acceptChallenge, addChallengeProgress, deleteCustomChallenge, notify } = useApp()
  const [amt, setAmt] = useState('')
  const uc = state.userChallenges[c.id]
  const { status, pct } = calculateChallengeProgress(c, uc)
  const add = () => {
    const n = Number(amt)
    if (!(n > 0)) return
    addChallengeProgress(c.id, n); setAmt('')
    notify(uc && uc.progress + n >= c.target ? 'Challenge completed' : 'Progress added')
  }
  const remove = () => {
    const warn = uc ? ' Your progress on it will be deleted too.' : ''
    if (window.confirm(`Delete “${c.name}”?${warn}`)) { deleteCustomChallenge(c.id); notify('Challenge deleted') }
  }
  return (
    <section className="card stack" style={{ gap: 10 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h3>{c.name}</h3>
        <span className="row" style={{ gap: 6 }}>{c.custom && <span className="badge">Yours</span>}<span className="badge">{STATUS[status]}</span></span></div>
      <p className="mute">{label(CHALLENGE_CATEGORIES, c.category)} · {LEVELS[c.level]}</p>
      <div className="chips">{challengeSpec(c).map((part) => <span className="badge" key={part}>{part}</span>)}</div>
      {c.description && <p>{c.description}</p>}
      {uc ? <>
        <Bar pct={pct} brass={status === 'completed'} />
        <p className="mute">{uc.progress} / {c.target} {c.unit} · started {fmt(uc.startedOn)}</p>
        {status !== 'completed' && <div className="row"><input className="input" style={{ maxWidth: 120 }} type="number" min={1} inputMode="numeric" placeholder={c.unit} aria-label={`Add ${c.unit}`} value={amt} onChange={(e) => setAmt(e.target.value)} />
          <button className="btn ghost" disabled={!(Number(amt) > 0)} onClick={add}>Add progress</button></div>}
      </> : <div><button className="btn" onClick={() => { acceptChallenge(c.id); notify('Challenge accepted') }}>Accept challenge · {c.target} {c.unit}</button></div>}
      {c.custom && <div className="row"><button className="btn ghost" onClick={onEdit}>Edit</button><button className="btn danger" onClick={remove}>Delete</button></div>}
    </section>
  )
}

export function ChallengesPage() {
  const { state, addCustomChallenge, updateCustomChallenge, notify } = useApp()
  const [sheet, setSheet] = useState<Challenge | 'new' | null>(null)
  const [category, setCategory] = useState<ChallengeCategory | 'all'>('all')
  const all = [...CHALLENGES, ...state.customChallenges].filter((c) => category === 'all' || c.category === category)

  return (
    <div className="stack">
      <PageHead title="Challenges" sub="Targets built from the movements you already train."
        right={<button className="btn" onClick={() => setSheet('new')}>New challenge</button>} />
      <Segmented label="Category" value={category} options={[{ value: 'all', label: 'All' }, ...CHALLENGE_CATEGORIES]} onChange={setCategory} />
      {all.length === 0 && <section className="card"><Empty title="No challenges here yet." body="Create one with New challenge." /></section>}
      {([1, 2, 3] as const).filter((lv) => all.some((c) => c.level === lv)).map((lv) => (
        <div className="stack" key={lv}><h2>{LEVELS[lv]}</h2>
          {all.filter((c) => c.level === lv).map((c) => <ChallengeCard key={c.id} c={c} onEdit={() => setSheet(c)} />)}</div>
      ))}
      {sheet && <ChallengeSheet initial={sheet === 'new' ? undefined : sheet} onClose={() => setSheet(null)}
        onSave={(input) => {
          if (sheet === 'new') { addCustomChallenge(input); notify('Challenge created') } else { updateCustomChallenge(sheet.id, input); notify('Challenge updated') }
          setSheet(null)
        }} />}
    </div>
  )
}
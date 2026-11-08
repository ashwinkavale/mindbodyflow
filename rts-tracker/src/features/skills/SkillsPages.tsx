import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useApp } from '../../app/store'
import { Empty, PageHead, RatingInput, Segmented } from '../../components/ui'
import { SKILLS } from '../../data/seed'
import { CONFIDENCE_SCALE, EXPERTISE, TOOLS, label } from '../../lib/options'
import { SKILL_STATE_LABEL, calculateSkillsAcquired, skillState } from '../../utils/calc'
import { fmt } from '../../utils/date'
import type { Tool } from '../../types'

export function SkillsPage() {
  const { state } = useApp()
  const [q, setQ] = useState('')
  const [tool, setTool] = useState<Tool | 'all'>('all')
  const shown = SKILLS.filter((s) => (tool === 'all' || s.tool === tool) && s.name.toLowerCase().includes(q.toLowerCase()))
  const learned = calculateSkillsAcquired(state.userSkills)
  const groups = [...new Set(shown.map((s) => `${s.tool}|${s.category}`))]

  return (
    <div className="stack">
      <PageHead title="My Skills" sub={`${learned} of ${SKILLS.length} learned`} />
      <div className="row">
        <input className="input grow" style={{ minWidth: 200 }} type="search" placeholder="Search skills" aria-label="Search skills" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tabs">{[{ value: 'all', label: 'All' }, ...TOOLS].map((t) => (
          <button key={t.value} className={tool === t.value ? 'on' : ''} onClick={() => setTool(t.value as Tool | 'all')}>{t.label}</button>))}</div>
      </div>
      {learned === 0 && !q && <section className="card"><Empty title="Your skill journey starts here." body="Explore the library and mark your first skill." /></section>}
      {shown.length === 0 ? <section className="card"><Empty title={`No skill matches “${q}”.`} body="Try a shorter name, or switch to All." /></section> : groups.map((g) => {
        const [t, cat] = g.split('|')
        return (
          <section className="card" key={g}><h3>{cat}</h3><p className="mute">{label(TOOLS, t as Tool)}</p>
            <div className="list" style={{ marginTop: 8 }}>{shown.filter((s) => `${s.tool}|${s.category}` === g).map((s) => {
              const u = state.userSkills[s.id], st = skillState(u)
              return <Link key={s.id} to={`/skills/${s.id}`} className="skill-row">
                <span className="row" style={{ gap: 10 }}>{u?.learned ? <Check size={18} color="var(--ok)" aria-label="Learned" /> : <span style={{ width: 18 }} />}<b>{s.name}</b></span>
                <span className={`badge ${st}`}>{SKILL_STATE_LABEL[st]}</span></Link>
            })}</div></section>)
      })}
    </div>
  )
}

export function SkillDetail() {
  const { skillId } = useParams()
  const { state, updateSkill, setNextSkill, notify } = useApp()
  const nav = useNavigate()
  const skill = SKILLS.find((s) => s.id === skillId)
  const u = skillId ? state.userSkills[skillId] : undefined
  const [notes, setNotes] = useState(u?.notes ?? '')
  if (!skill) return <Empty title="That skill isn't in the library." action={<Link className="btn" to="/skills">Back to skills</Link>} />
  const st = skillState(u)
  const isNext = state.nextSkillId === skill.id

  return (
    <div className="stack">
      <PageHead title={skill.name} sub={`${label(TOOLS, skill.tool)} · ${skill.category}`} right={<span className={`badge ${st}`}>{SKILL_STATE_LABEL[st]}</span>} />
      <section className="card stack">
        <div className="row"><button className={'chip' + (u?.learned ? ' on ok' : '')} aria-pressed={!!u?.learned}
          onClick={() => { updateSkill(skill.id, { learned: !u?.learned }); notify(u?.learned ? 'Marked as not learned' : 'Skill marked as learned') }}>
          {u?.learned ? 'Learned' : 'Mark as learned'}</button>
          {u?.learnedOn && <span className="mute">Since {fmt(u.learnedOn, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}</div>
        <Segmented label="Expertise level" value={u?.expertise ?? 'beginner'} options={EXPERTISE} onChange={(v) => updateSkill(skill.id, { expertise: v })} />
        <RatingInput label="Control" value={u?.control ?? 0} onChange={(v) => updateSkill(skill.id, { control: v })} />
        <RatingInput label="Confidence" scale value={u?.confidence ?? 0} onChange={(v) => updateSkill(skill.id, { confidence: v })} />
        <p className="mute">{CONFIDENCE_SCALE.slice(1).join('   ')}</p>
        <label className="field"><span className="field-label">Personal notes</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (u?.notes ?? '') && updateSkill(skill.id, { notes })} /></label>
      </section>
      <section className="card"><h3>Progress history</h3>
        {u?.history.length ? <div className="list" style={{ marginTop: 8 }}>{[...u.history].reverse().map((h) => (
          <div key={h.date} className="skill-row"><span>{fmt(h.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span><span className="mute">Control {h.control}/5 · Confidence {h.confidence}/5</span></div>))}</div>
          : <p className="mute" style={{ marginTop: 6 }}>Rate control and confidence to start a history.</p>}</section>
      <div className="row"><button className="btn" disabled={isNext} onClick={() => { setNextSkill(skill.id); notify('Set as your next skill'); nav('/next-step') }}>{isNext ? 'This is your next skill' : 'Work on this next'}</button>
        <Link className="btn ghost" to="/skills">All skills</Link></div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/store'
import { Bar, Empty, PageHead } from '../../components/ui'
import { SKILLS } from '../../data/seed'
import { WeekPlanCard } from '../plan/WeekPlanCard'
import { CONFIDENCE_SCALE, TOOLS, TRAINING_TYPES, label } from '../../lib/options'
import { isActive } from '../../utils/calc'
import { addDays, today } from '../../utils/date'

export function NextStepPage() {
  const { state, setNextSkill, notify } = useApp()
  const [picking, setPicking] = useState(false)
  const next = SKILLS.find((s) => s.id === state.nextSkillId)
  const u = next && state.userSkills[next.id]
  const conf = u?.confidence ?? 0, ctl = u?.control ?? 0
  const targetConf = Math.min(5, conf + 1)

  const since = addDays(today(), -28)
  const tally = new Map<string, number>()
  state.sessions.filter((s) => isActive(s) && s.date >= since && s.trainingType && s.trainingType !== 'rts')
    .forEach((s) => tally.set(s.trainingType!, (tally.get(s.trainingType!) ?? 0) + 1))
  const focusTool = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const suggestions = SKILLS.filter((s) => !state.userSkills[s.id]?.learned && s.id !== next?.id && (!focusTool || s.tool === focusTool)).slice(0, 3)

  return (
    <div className="stack">
      <PageHead title="Next Step" sub="Your next skill and your plan for next week." />
      {next ? (
        <section className="card stack">
          <div><h2>{next.name}</h2><p className="mute">{label(TOOLS, next.tool)}</p></div>
          <div className="grid2">
            <div><p className="mute">Control</p><b style={{ font: '600 28px var(--display)' }}>{ctl} / 5</b><Bar pct={ctl * 20} /></div>
            <div><p className="mute">Confidence</p><b style={{ font: '600 28px var(--display)' }}>{conf} / 5</b><Bar pct={conf * 20} /></div>
          </div>
          <p>{conf >= 5 ? 'Mastered. Pick your next skill below.' : `Next target: confidence ${targetConf} (${CONFIDENCE_SCALE[targetConf].slice(3)})`}</p>
          <div className="row"><Link className="btn" to={`/skills/${next.id}`}>Open skill</Link><button className="btn ghost" onClick={() => setPicking(true)}>Change</button>
            <button className="btn danger" onClick={() => { setNextSkill(null); notify('Next skill cleared') }}>Clear</button></div>
        </section>
      ) : <section className="card"><Empty title="Choose the skill you want to work toward next." action={<button className="btn" onClick={() => setPicking(true)}>Choose a skill</button>} /></section>}
      <WeekPlanCard />
      {suggestions.length > 0 && (
        <section className="card"><h3>Not learned yet{focusTool ? `, in ${label(TOOLS, focusTool as never)}` : ''}</h3>
          {focusTool && <p className="mute">You've trained {label(TRAINING_TYPES, focusTool as never)} most over the last four weeks.</p>}
          <div className="list" style={{ marginTop: 8 }}>{suggestions.map((s) => (
            <div key={s.id} className="skill-row"><span><b>{s.name}</b><br /><span className="mute">{s.category}</span></span>
              <button className="btn ghost" onClick={() => { setNextSkill(s.id); notify('Set as your next skill') }}>Set next</button></div>))}</div></section>
      )}
      {picking && (
        <section className="card"><h3>Pick from the full library</h3>
          <div className="list" style={{ marginTop: 8 }}>{SKILLS.map((s) => (
            <button key={s.id} className="skill-row chip" style={{ borderRadius: 10, border: 0, justifyContent: 'space-between', width: '100%' }}
              onClick={() => { setNextSkill(s.id); setPicking(false); notify('Next skill updated') }}><b>{s.name}</b><span className="mute">{label(TOOLS, s.tool)}</span></button>))}</div></section>
      )}
    </div>
  )
}
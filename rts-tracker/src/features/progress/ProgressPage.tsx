import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../../app/store'
import { Empty, PageHead } from '../../components/ui'
import { SKILLS } from '../../data/seed'
import { DURATION, EFFORT, STATUS, TRAINING_TYPES, label } from '../../lib/options'
import { calculateMonthlyConsistency, calculateNewSkills, calculatePeriodStats, calculateSkillsProgressed, isActive } from '../../utils/calc'
import { addDays, fmt, parse, today, weekStart } from '../../utils/date'
import type { TrainingSession } from '../../types'
import { AXIS, Chart, tip } from './charts'
import { Insights } from './Insights'

type View = 'daily' | 'weekly' | 'monthly' | 'insights'

export function ProgressPage() {
  const { state } = useApp()
  const [view, setView] = useState<View>('weekly')
  const now = today(), target = state.profile?.weeklyTarget ?? 5
  const empty = state.sessions.length === 0

  return (
    <div className="stack">
      <PageHead title="My Progress" sub="Consistency first, then improvement."
        right={<div className="tabs" role="tablist">{(['daily', 'weekly', 'monthly', 'insights'] as View[]).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>))}</div>} />
      {empty ? <section className="card"><Empty title="Nothing to chart yet." body="Log a session on Today and your week will fill in here." /></section>
        : view === 'daily' ? <Daily sessions={state.sessions} now={now} />
        : view === 'weekly' ? <Weekly now={now} target={target} />
        : view === 'monthly' ? <Monthly now={now} target={target} /> : <Insights now={now} target={target} />}
    </div>
  )
}

function Daily({ sessions, now }: { sessions: TrainingSession[]; now: string }) {
  const { state } = useApp()
  const days = Array.from({ length: 7 }, (_, i) => addDays(now, -i))
  return <section className="card"><div className="list">{days.map((d) => {
    const s = sessions.find((x) => x.date === d)
    return <div key={d} className="stack" style={{ gap: 4 }}>
      <div className="row"><b className="grow">{fmt(d, { weekday: 'long', day: 'numeric', month: 'short' })}</b><span className="badge">{s ? label(STATUS, s.status) : 'Not logged'}</span></div>
      {s?.trainingType && <p>{label(TRAINING_TYPES, s.trainingType)} · {label(DURATION, s.duration)} · {label(EFFORT, s.effort)}</p>}
      {s && (s.energy || s.movement || s.recovery) && <p className="mute">Energy {s.energy} · Movement {s.movement} · Recovery {s.recovery}</p>}
      {s?.painLevel && s.painLevel !== 'none' && <p className="mute">Discomfort: {s.painLevel}{s.painLocation ? `, ${s.painLocation}` : ''}</p>}
      {s?.highlight && <p>“{s.highlight}”</p>}
      {state.achievements.filter((a) => a.date === d).map((a) => <p key={a.id}><span className="mute">Achievement · </span>{a.body}</p>)}
    </div>
  })}</div></section>
}

function Weekly({ now, target }: { now: string; target: number }) {
  const { state } = useApp()
  const from = weekStart(now), to = addDays(from, 6)
  const w = calculatePeriodStats(state.sessions, from, to, target)
  const progressed = calculateSkillsProgressed(state.userSkills, from, to)
  const added = calculateNewSkills(state.userSkills, from, to)
  const thisWeek = state.sessions.filter((s) => s.date >= from && s.date <= to && isActive(s))
  const counts = new Map<string, number>()
  thisWeek.forEach((s) => s.trainingType && counts.set(s.trainingType, (counts.get(s.trainingType) ?? 0) + 1))
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] as TrainingSession['trainingType']
  const touched = Object.values(state.userSkills).filter((u) => u.history.some((h) => h.date >= from && h.date <= to)).slice(0, 2)
  const next = SKILLS.find((s) => s.id === state.nextSkillId)
  const plan = state.plans[addDays(from, 7)]
  const plannedCount = plan?.days.filter((d) => d.type && d.type !== 'rest').length ?? 0

  const series = Array.from({ length: 8 }, (_, i) => {
    const f = addDays(from, (i - 7) * 7), t = addDays(f, 6), p = calculatePeriodStats(state.sessions, f, t, target)
    const learned = Object.values(state.userSkills).filter((u) => u.learned && u.learnedOn && u.learnedOn <= t).length
    return { week: fmt(f), sessions: p.sessions, minutes: p.minutes, effort: p.avgEffort === null ? null : Number(p.avgEffort.toFixed(1)), skills: learned }
  })

  return (
    <div className="stack">
      <section className="card"><h2 style={{ marginBottom: 14 }}>Your week</h2>
        <div className="stats">
          <div className="stat"><b>{w.sessions}</b><span>Sessions</span></div>
          <div className="stat"><b>{w.minutes}</b><span>Training time (min)</span></div>
          <div className="stat"><b>{w.consistency}%</b><span>Consistency</span></div>
          <div className="stat"><b>{w.avgEffort ? w.avgEffort.toFixed(1) : '–'}</b><span>Average effort / 5</span></div>
        </div></section>
      <div className="grid2">
        <section className="card"><h3>Skills</h3><div className="stats" style={{ marginTop: 10 }}>
          <div className="stat"><b>{progressed}</b><span>Progressed</span></div><div className="stat"><b>{added.length}</b><span>New this week</span></div></div></section>
        <section className="card stack" style={{ gap: 10 }}><h3>This week's focus</h3>
          {top || touched.length ? <>{top && <p>{label(TRAINING_TYPES, top)}</p>}{touched.map((u) => <p key={u.skillId}>{SKILLS.find((s) => s.id === u.skillId)?.name}</p>)}</>
            : <p className="mute">Train once and your focus shows up here.</p>}
          <h3>Next week's goal</h3>
          {plan && <p>{plan.focus || `${plannedCount} sessions planned`}</p>}
          {next ? <Link to={`/skills/${next.id}`}>{next.name}</Link> : <Link to="/next-step" className="mute">Choose your next skill</Link>}</section>
      </div>
      <div className="grid2">
        <Chart title="Sessions per week" note={`Target ${target}`}><BarChart data={series}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="week" tick={AXIS} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...tip} /><Bar dataKey="sessions" fill="var(--accent)" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Training time" note="Minutes per week"><BarChart data={series}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="week" tick={AXIS} /><YAxis tick={AXIS} width={34} /><Tooltip {...tip} /><Bar dataKey="minutes" fill="var(--brass)" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Effort" note="Average per week, out of 5"><LineChart data={series}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="week" tick={AXIS} /><YAxis domain={[1, 5]} tick={AXIS} width={28} /><Tooltip {...tip} /><Line dataKey="effort" stroke="var(--accent)" strokeWidth={2.5} connectNulls dot={{ r: 3 }} /></LineChart></Chart>
        <Chart title="Skills learned" note="Running total"><LineChart data={series}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="week" tick={AXIS} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...tip} /><Line dataKey="skills" stroke="var(--ok)" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></Chart>
      </div>
    </div>
  )
}

function Monthly({ now, target }: { now: string; target: number }) {
  const { state } = useApp()
  const m = calculateMonthlyConsistency(state.sessions, now, target)
  const lead = (parse(m.from).getDay() + 6) % 7
  const days = parse(m.to).getDate()
  const dist = TRAINING_TYPES.map((t) => ({ name: t.label, sessions: state.sessions.filter((s) => s.date >= m.from && s.date <= m.to && isActive(s) && s.trainingType === t.value).length }))
  return (
    <div className="stack">
      <section className="card"><h2 style={{ marginBottom: 14 }}>{fmt(m.from, { month: 'long', year: 'numeric' })}</h2>
        <div className="stats"><div className="stat"><b>{m.sessions}</b><span>Sessions</span></div><div className="stat"><b>{m.minutes}</b><span>Minutes</span></div>
          <div className="stat"><b>{m.consistency}%</b><span>Consistency</span></div><div className="stat"><b>{m.avgEffort ? m.avgEffort.toFixed(1) : '–'}</b><span>Average effort / 5</span></div></div></section>
      <div className="grid2">
        <section className="card"><div className="cal" aria-label="Month calendar">
          {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const date = `${m.from.slice(0, 8)}${String(i + 1).padStart(2, '0')}`
            return <div key={date} className={state.sessions.find((s) => s.date === date)?.status ?? ''} title={date}>{i + 1}</div>
          })}</div></section>
        <Chart title="What you trained" note="Sessions this month"><BarChart data={dist} layout="vertical"><XAxis type="number" allowDecimals={false} tick={AXIS} /><YAxis type="category" dataKey="name" tick={AXIS} width={90} /><Tooltip {...tip} /><Bar dataKey="sessions" fill="var(--accent)" radius={[0, 6, 6, 0]} /></BarChart></Chart>
      </div>
    </div>
  )
}
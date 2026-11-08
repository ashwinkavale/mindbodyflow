import { useState } from 'react'
import { useApp } from '../../app/store'
import { Empty, PageHead } from '../../components/ui'
import { DURATION, EFFORT, STATUS, TRAINING_TYPES, label, planText } from '../../lib/options'
import { calculateCurrentStreak, calculateWeeklyConsistency } from '../../utils/calc'
import { fmt, parse, today, weekStart } from '../../utils/date'
import { Achievements } from './Achievements'
import { LogSheet } from './LogSheet'
import { WeekRing } from './WeekRing'

export function TodayPage() {
  const { state, logSession, deleteSession, notify } = useApp()
  const [open, setOpen] = useState(false)
  const now = today()
  const todays = state.sessions.find((s) => s.date === now)
  const target = state.profile?.weeklyTarget ?? 5
  const streak = calculateCurrentStreak(state.sessions, now)
  const week = calculateWeeklyConsistency(state.sessions, now, target)
  const plannedDay = state.plans[weekStart(now)]?.days[(parse(now).getDay() + 6) % 7]
  const planned = plannedDay?.type ? planText(plannedDay) : ''
  const recent = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="stack">
      <PageHead title={fmt(now, { weekday: 'long', day: 'numeric', month: 'long' })} sub={`Hi ${state.profile?.name.split(' ')[0]}.`}
        right={<button className="btn" onClick={() => setOpen(true)}>{todays ? 'Edit today' : 'Log Training'}</button>} />
      <div className="grid2">
        <section className="card"><WeekRing sessions={state.sessions} now={now} streak={streak} />
          <p className="mute" style={{ textAlign: 'center', marginTop: 8 }}>{week.sessions} of {target} sessions this week</p></section>
        <section className="card">
          {todays ? (
            <div className="stack">
              <div><span className="badge">{label(STATUS, todays.status)}</span></div>
              {todays.trainingType && <h2>{label(TRAINING_TYPES, todays.trainingType)}</h2>}
              {todays.duration && <p>{label(DURATION, todays.duration)} · {label(EFFORT, todays.effort)}</p>}
              {todays.painLevel && todays.painLevel !== 'none' && <p className="mute">Discomfort{todays.painLocation ? ` in ${todays.painLocation}` : ''}</p>}
              {todays.highlight && <p>“{todays.highlight}”</p>}
            </div>
          ) : <Empty title="Nothing logged today." body="Log your session and keep your progress moving."
            action={planned ? <span className="badge">Planned · {planned}</span> : undefined} />}
        </section>
      </div>
      <Achievements />
      <section className="card">
        <h2 style={{ marginBottom: 6 }}>Recent sessions</h2>
        {recent.length === 0 ? <Empty title="Your log starts with one session." body="It takes about a minute." /> : (
          <div className="list">{recent.map((s) => (
            <div key={s.id} className="skill-row">
              <div><b>{fmt(s.date, { weekday: 'short', day: 'numeric', month: 'short' })}</b>
                <p className="mute">{s.trainingType ? `${label(TRAINING_TYPES, s.trainingType)} · ${label(DURATION, s.duration)}` : label(STATUS, s.status)}</p></div>
              <button className="btn danger" onClick={() => { if (window.confirm('Delete this log?')) { deleteSession(s.id); notify('Log deleted') } }}>Delete</button>
            </div>))}</div>
        )}
      </section>
      {open && <LogSheet date={now} existing={todays} onClose={() => setOpen(false)}
        onSave={(d) => { logSession(d); setOpen(false); notify('Session saved') }} />}
    </div>
  )
}
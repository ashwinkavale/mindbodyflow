import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../../app/store'
import { CHALLENGES, SKILLS } from '../../data/seed'
import { DURATION, STATUS, TRAINING_TYPES } from '../../lib/options'
import {
  calculateAchievementSeries, calculateChallengeRows, calculateConsistencySeries, calculateDiscomfortSeries, calculateDurationMix,
  calculateFeelSeries, calculateHealthSeries, calculateStatusMix, calculateToolProgress, calculateTypeMix, calculateWeekdayPattern,
  weekBuckets, type HealthKey,
} from '../../utils/calc'
import { addDays, fmt } from '../../utils/date'
import { AXIS, Chart, GRID, TYPE_COLOR, legend, tip } from './charts'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS_COLOR = {
  completed: 'var(--accent)', partial: 'color-mix(in srgb, var(--accent) 45%, var(--surface))', rest: 'var(--mute)', missed: 'var(--warn)',
}
const HEALTH: { key: HealthKey; title: string; unit: string; color: string; bars?: boolean }[] = [
  { key: 'sleepHours', title: 'Sleep', unit: 'hours', color: 'var(--violet)' },
  { key: 'restingHr', title: 'Resting heart rate', unit: 'bpm', color: 'var(--warn)' },
  { key: 'weightKg', title: 'Weight', unit: 'kg', color: 'var(--ok)' },
  { key: 'steps', title: 'Steps', unit: 'per day', color: 'var(--brass)', bars: true },
]

const weekAxis = { dataKey: 'from', tick: AXIS, tickFormatter: (v: string) => fmt(v) }
const weekTip = { ...tip, labelFormatter: (v: unknown) => `Week of ${fmt(String(v))}` }
const level = (v: number) => ['', 'Low', 'Mid', 'High'][v] ?? ''
const trim = (s: string) => (s.length > 18 ? `${s.slice(0, 17)}…` : s)

export function Insights({ now, target }: { now: string; target: number }) {
  const { state } = useApp()
  const weeks = weekBuckets(now, 12)
  const d30 = addDays(now, -29), d90 = addDays(now, -89)

  const mix = calculateTypeMix(state.sessions, weeks)
  const consistency = calculateConsistencySeries(state.sessions, weeks, target)
  const feel = calculateFeelSeries(state.sessions, weeks)
  const pain = calculateDiscomfortSeries(state.sessions, weeks)
  const posts = calculateAchievementSeries(state.achievements, weeks)

  const status = calculateStatusMix(state.sessions, d30, now)
  const outcomes = STATUS.map((o) => ({ name: o.label, value: status[o.value], fill: STATUS_COLOR[o.value] })).filter((d) => d.value > 0)
  const weekday = calculateWeekdayPattern(state.sessions, d90, now).map((n, i) => ({ day: WEEKDAYS[i], sessions: n }))
  const durations = calculateDurationMix(state.sessions, d90, now)
  const lengths = DURATION.map((o) => ({ name: o.label.replace(' min', ''), sessions: durations[o.value] }))

  const tools = calculateToolProgress(SKILLS, state.userSkills)
  const challenges = calculateChallengeRows([...CHALLENGES, ...state.customChallenges], state.userChallenges)
  const hasBody = state.health.length >= 2

  return (
    <div className="stack">
      <h2>Training</h2>
      <div className="grid2">
        <Chart title="What you trained" note="Sessions per week, last 12 weeks">
          <BarChart data={mix}><CartesianGrid {...GRID} /><XAxis {...weekAxis} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...weekTip} /><Legend {...legend} />
            {TRAINING_TYPES.map((t) => <Bar key={t.value} dataKey={t.value} name={t.label} stackId="mix" fill={TYPE_COLOR[t.value]} />)}</BarChart>
        </Chart>
        <Chart title="Consistency" note={`Share of your ${target}-session target, per week`}>
          <LineChart data={consistency}><CartesianGrid {...GRID} /><XAxis {...weekAxis} /><YAxis domain={[0, 100]} unit="%" tick={AXIS} width={40} /><Tooltip {...weekTip} />
            <Line dataKey="consistency" name="Consistency (%)" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart>
        </Chart>
        <Chart title="Outcomes" note="Every logged day, last 30 days" empty={outcomes.length ? undefined : 'Nothing logged in the last 30 days.'}>
          <PieChart><Pie data={outcomes} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none">
            {outcomes.map((d) => <Cell key={d.name} fill={d.fill} />)}</Pie><Tooltip {...tip} /><Legend {...legend} layout="vertical" align="right" verticalAlign="middle" /></PieChart>
        </Chart>
        <Chart title="Your weekly rhythm" note="Sessions by weekday, last 90 days">
          <BarChart data={weekday}><CartesianGrid {...GRID} /><XAxis dataKey="day" tick={AXIS} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...tip} />
            <Bar dataKey="sessions" fill="var(--brass)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
        <Chart title="Session length" note="Sessions by duration in minutes, last 90 days">
          <BarChart data={lengths}><CartesianGrid {...GRID} /><XAxis dataKey="name" tick={AXIS} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...tip} />
            <Bar dataKey="sessions" fill="var(--accent)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
      </div>

      <h2>Feel and recovery</h2>
      <div className="grid2">
        <Chart title="How you felt" note="Weekly average of your session check-ins">
          <LineChart data={feel}><CartesianGrid {...GRID} /><XAxis {...weekAxis} /><YAxis domain={[1, 3]} ticks={[1, 2, 3]} tickFormatter={level} tick={AXIS} width={40} /><Tooltip {...weekTip} /><Legend {...legend} />
            <Line dataKey="energy" name="Energy" stroke="var(--accent)" strokeWidth={2.5} connectNulls dot={{ r: 3 }} />
            <Line dataKey="movement" name="Movement" stroke="var(--brass)" strokeWidth={2.5} connectNulls dot={{ r: 3 }} />
            <Line dataKey="recovery" name="Recovery" stroke="var(--violet)" strokeWidth={2.5} connectNulls dot={{ r: 3 }} /></LineChart>
        </Chart>
        <Chart title="Discomfort" note="Sessions with discomfort, per week">
          <BarChart data={pain}><CartesianGrid {...GRID} /><XAxis {...weekAxis} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...weekTip} /><Legend {...legend} />
            <Bar dataKey="mild" name="Mild" stackId="p" fill="var(--brass)" /><Bar dataKey="moderate" name="Moderate" stackId="p" fill="var(--orange)" />
            <Bar dataKey="significant" name="Significant" stackId="p" fill="var(--warn)" /></BarChart>
        </Chart>
      </div>

      <h2>Skills, challenges and wins</h2>
      <div className="grid2">
        <Chart title="Skills by tool" note="Learned vs still to learn" height={150}>
          <BarChart data={tools} layout="vertical"><XAxis type="number" allowDecimals={false} tick={AXIS} /><YAxis type="category" dataKey="name" tick={AXIS} width={90} /><Tooltip {...tip} /><Legend {...legend} />
            <Bar dataKey="learned" name="Learned" stackId="s" fill="var(--ok)" /><Bar dataKey="remaining" name="To learn" stackId="s" fill="var(--line)" /></BarChart>
        </Chart>
        <Chart title="Achievements posted" note="Per week, last 12 weeks">
          <BarChart data={posts}><CartesianGrid {...GRID} /><XAxis {...weekAxis} /><YAxis allowDecimals={false} tick={AXIS} width={28} /><Tooltip {...weekTip} />
            <Bar dataKey="posts" name="Posts" fill="var(--violet)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
        <Chart title="Challenge progress" note="Challenges you've accepted" height={Math.max(120, challenges.length * 34 + 40)}
          empty={challenges.length ? undefined : 'Accept a challenge and its progress shows up here.'}>
          <BarChart data={challenges} layout="vertical"><XAxis type="number" domain={[0, 100]} unit="%" tick={AXIS} /><YAxis type="category" dataKey="name" tick={AXIS} width={120} tickFormatter={trim} /><Tooltip {...tip} />
            <Bar dataKey="pct" name="Complete (%)" fill="var(--brass)" radius={[0, 6, 6, 0]} /></BarChart>
        </Chart>
      </div>

      <h2>Body</h2>
      {hasBody
        ? <div className="grid2">{HEALTH.map(({ key, title, unit, color, bars }) => {
          const rows = calculateHealthSeries(state.health, key, d90)
          return (
            <Chart key={key} title={title} note={`${unit}, last 90 days`} empty={rows.length < 2 ? `Needs readings on at least two days.` : undefined}>
              {bars
                ? <BarChart data={rows}><CartesianGrid {...GRID} /><XAxis dataKey="date" tick={AXIS} tickFormatter={(v: string) => fmt(v)} /><YAxis tick={AXIS} width={40} /><Tooltip {...tip} labelFormatter={(v) => fmt(String(v))} /><Bar dataKey="value" name={title} fill={color} radius={[6, 6, 0, 0]} /></BarChart>
                : <LineChart data={rows}><CartesianGrid {...GRID} /><XAxis dataKey="date" tick={AXIS} tickFormatter={(v: string) => fmt(v)} /><YAxis domain={['auto', 'auto']} tick={AXIS} width={40} /><Tooltip {...tip} labelFormatter={(v) => fmt(String(v))} /><Line dataKey="value" name={title} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} /></LineChart>}
            </Chart>
          )
        })}</div>
        : <section className="card"><p className="mute">Sleep, heart rate, weight and steps charts appear once you've saved health metrics on two different days. Add them from your profile.</p></section>}
    </div>
  )
}
import type { TrainingSession } from '../../types'
import { addDays, weekStart } from '../../utils/date'

const COLOR: Record<string, string> = { completed: 'var(--accent)', partial: 'color-mix(in srgb,var(--accent) 45%,var(--surface))', rest: 'var(--mute)', missed: 'var(--warn)' }
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Seven arcs, one per weekday, around the current streak. The week reads as a closed loop of movement. */
export function WeekRing({ sessions, now, streak }: { sessions: TrainingSession[]; now: string; streak: number }) {
  const start = weekStart(now), c = 80, r = 64, gap = 0.1, step = (Math.PI * 2) / 7
  const pt = (a: number): [number, number] => [c + r * Math.sin(a), c - r * Math.cos(a)]
  return (
    <svg className="ring" width="200" height="200" viewBox="0 0 160 160" role="img" aria-label={`${streak} day streak`}>
      {DAYS.map((d, i) => {
        const date = addDays(start, i), st = sessions.find((s) => s.date === date)?.status
        const a0 = i * step + gap, a1 = (i + 1) * step - gap
        const [x0, y0] = pt(a0), [x1, y1] = pt(a1)
        return (
          <g key={date}>
            <path d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={date === now ? 12 : 9} strokeLinecap="round"
              stroke={st ? COLOR[st] : 'var(--line)'} strokeDasharray={st === 'missed' ? '1 7' : undefined}>
              <title>{`${d} ${st ?? 'not logged'}`}</title></path>
          </g>
        )
      })}
      <text x="80" y="82" textAnchor="middle" fontSize="38" fontWeight="700" fill="var(--ink)">{streak}</text>
      <text x="80" y="102" textAnchor="middle" fontSize="11" fill="var(--mute)">day streak</text>
    </svg>
  )
}

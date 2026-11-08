import type { ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'
import type { TrainingType } from '../../types'

export const AXIS = { fontSize: 12, fill: 'var(--mute)' }
export const GRID = { vertical: false, stroke: 'var(--line)' }
export const tip = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10 },
  labelStyle: { color: 'var(--ink)' },
  itemStyle: { color: 'var(--ink)' },
}
export const legend = {
  wrapperStyle: { fontSize: 12 },
  formatter: (value: string) => <span style={{ color: 'var(--mute)' }}>{value}</span>,
}

export const TYPE_COLOR: Record<TrainingType, string> = {
  'indian-clubs': 'var(--accent)', 'rope-flow': 'var(--brass)', mace: 'var(--ok)', rts: 'var(--violet)',
}

interface ChartProps {
  title: string
  note?: string
  height?: number
  /** When set, this message replaces the chart. */
  empty?: string
  children: ReactElement
}

export function Chart({ title, note, height = 180, empty, children }: ChartProps) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {note && <p className="mute" style={{ marginBottom: 8 }}>{note}</p>}
      {empty
        ? <p className="mute" style={{ margin: '24px 0 8px' }}>{empty}</p>
        : <div style={{ height, marginTop: 8 }}><ResponsiveContainer>{children}</ResponsiveContainer></div>}
    </section>
  )
}
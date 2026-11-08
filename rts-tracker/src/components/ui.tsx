import { useEffect, useRef, type ReactNode } from 'react'
import { CONFIDENCE_SCALE } from '../lib/options'
import type { Rating } from '../types'

export function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value?: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <div className="field" role="radiogroup" aria-label={label}>
      <span className="field-label">{label}</span>
      <div className="chips">
        {options.map((o) => (
          <button type="button" role="radio" aria-checked={value === o.value} key={o.value}
            className={'chip' + (value === o.value ? ' on' : '')} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

export function RatingInput({ label, value, onChange, scale }: { label: string; value: Rating; onChange: (v: Rating) => void; scale?: boolean }) {
  return (
    <div className="field" role="radiogroup" aria-label={label}>
      <span className="field-label">{label}{value > 0 && scale ? ` · ${CONFIDENCE_SCALE[value]}` : ''}</span>
      <div className="rating">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`}
            className={value === n ? 'on' : n < value ? 'fill' : ''} onClick={() => onChange(value === n ? 0 : n)}>{n}</button>
        ))}
      </div>
    </div>
  )
}

export const Empty = ({ title, body, action }: { title: string; body?: string; action?: ReactNode }) => (
  <div className="empty"><h3>{title}</h3>{body && <p>{body}</p>}{action && <div style={{ marginTop: 14 }}>{action}</div>}</div>
)

export const PageHead = ({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) => (
  <header className="page-head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{right}</header>
)

export const Bar = ({ pct, brass }: { pct: number; brass?: boolean }) => (
  <div className={'bar' + (brass ? ' brass' : '')} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
)

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}><h2>{title}</h2>
          <button className="btn ghost" onClick={onClose}>Close</button></div>
        {children}
      </div>
    </>
  )
}

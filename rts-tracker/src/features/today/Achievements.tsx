import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../../app/store'
import type { Achievement } from '../../types'
import { fmt, today } from '../../utils/date'

const MAX = 500

function Entry({ a, showDate, onDelete }: { a: Achievement; showDate?: boolean; onDelete: () => void }) {
  return (
    <li className="ach">
      <div className="grow">
        <p>{a.body}</p>
        {showDate && <span className="mute">{fmt(a.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>}
      </div>
      <button className="icon-btn" aria-label="Delete this achievement" onClick={() => window.confirm('Delete this achievement?') && onDelete()}><X size={16} /></button>
    </li>
  )
}

export function Achievements() {
  const { state, addAchievement, deleteAchievement, notify } = useApp()
  const [text, setText] = useState('')
  const now = today()
  const todays = state.achievements.filter((a) => a.date === now)
  const earlier = state.achievements.filter((a) => a.date < now).slice(0, 5)

  const post = () => {
    const body = text.trim()
    if (!body) return
    addAchievement(body)
    setText('')
    notify('Posted to today')
  }

  return (
    <section className="card stack">
      <div><h2>Achievements today</h2><p className="mute">Something you're proud of, big or small.</p></div>
      <label className="field"><span className="field-label">What did you achieve today?</span>
        <textarea className="input" value={text} maxLength={MAX} placeholder="Linked two flows without stopping…" onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post() }} />
      </label>
      <div className="row"><span className="mute grow">{text.length}/{MAX}</span><button className="btn" disabled={!text.trim()} onClick={post}>Post</button></div>
      {todays.length > 0 && <ul className="list">{todays.map((a) => <Entry key={a.id} a={a} onDelete={() => deleteAchievement(a.id)} />)}</ul>}
      {earlier.length > 0 && <>
        <h3>Earlier</h3>
        <ul className="list">{earlier.map((a) => <Entry key={a.id} a={a} showDate onDelete={() => deleteAchievement(a.id)} />)}</ul>
      </>}
    </section>
  )
}
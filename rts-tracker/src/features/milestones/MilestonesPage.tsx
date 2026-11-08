import { Check, Lock, Loader } from 'lucide-react'
import { useApp } from '../../app/store'
import { Bar, PageHead } from '../../components/ui'
import { SKILLS } from '../../data/seed'
import { calculateMilestoneProgress } from '../../utils/calc'

const STATE_LABEL = { locked: 'Locked', 'in-progress': 'In progress', completed: 'Completed' }

export function MilestonesPage() {
  const { state } = useApp()
  const ms = calculateMilestoneProgress(SKILLS, state)
  const done = ms.filter((m) => m.status === 'completed').length
  return (
    <div className="stack">
      <PageHead title="Milestones" sub={`${done} of ${ms.length} reached. Each one is read from your logged sessions and skills.`} />
      {ms.map((m) => (
        <section key={m.id} className={`card ms ${m.status}`}>
          <span className="ico">{m.status === 'completed' ? <Check size={20} /> : m.status === 'locked' ? <Lock size={18} /> : <Loader size={18} />}</span>
          <div className="grow stack" style={{ gap: 6 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><h3>{m.title}</h3><span className="badge">{STATE_LABEL[m.status]}</span></div>
            <p className="mute">{m.description}</p>
            {m.target > 1 && <><Bar pct={Math.round((m.current / m.target) * 100)} brass={m.status === 'completed'} /><span className="mute">{m.current} / {m.target}</span></>}
          </div>
        </section>
      ))}
    </div>
  )
}

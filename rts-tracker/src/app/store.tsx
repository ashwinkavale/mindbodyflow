import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Achievement, AppState, Challenge, ChallengeInput, HealthMetric, TrainingSession, User, UserSkill, WeekPlan } from '../types'
import { repository as repo } from '../services/repository'
import { clearLegacyState, readLegacyState } from '../services/legacyLocal'
import { emptyState, seedState } from '../data/seed'
import { today } from '../utils/date'
import { useAuth } from './auth'

type SkillPatch = Partial<Pick<UserSkill, 'learned' | 'expertise' | 'control' | 'confidence' | 'notes'>>
type SessionInput = Omit<TrainingSession, 'id' | 'userId' | 'createdAt'>

interface Ctx {
  state: AppState
  toast: string | null
  userEmail: string
  notify(msg: string): void
  saveProfile(u: Omit<User, 'id'>): void
  logSession(s: SessionInput): void
  deleteSession(id: string): void
  updateSkill(skillId: string, patch: SkillPatch): void
  setNextSkill(id: string | null): void
  acceptChallenge(id: string): void
  addChallengeProgress(id: string, amount: number): void
  addCustomChallenge(input: ChallengeInput): void
  updateCustomChallenge(id: string, input: ChallengeInput): void
  deleteCustomChallenge(id: string): void
  addHealth(m: Omit<HealthMetric, 'id' | 'date'>): void
  addAchievement(body: string): void
  deleteAchievement(id: string): void
  saveWeekPlan(plan: WeekPlan): void
  resetData(mode: 'demo' | 'empty'): void
  /** Merges data left in this browser by the old local-only version. Resolves true if it was imported. */
  importLocalData(): Promise<boolean>
}

const AppContext = createContext<Ctx | null>(null)
export const useApp = () => {
  const c = useContext(AppContext)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}

/** randomUUID needs a secure context; the fallback covers testing over plain http on a LAN address. */
const uuid = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16))

const blankSkill = (skillId: string): UserSkill => ({ skillId, learned: false, expertise: 'beginner', control: 0, confidence: 0, notes: '', history: [] })

function applySkillPatch(prev: UserSkill, patch: SkillPatch): UserSkill {
  const next: UserSkill = { ...prev, ...patch }
  if ((patch.control ?? 0) > 0 || (patch.confidence ?? 0) > 0) next.learned = true
  if (next.learned && !prev.learned) next.learnedOn = today()
  if (!next.learned) next.learnedOn = undefined
  const changed = (patch.control !== undefined && patch.control !== prev.control) || (patch.confidence !== undefined && patch.confidence !== prev.confidence)
  if (changed && next.learned) {
    next.history = [...prev.history.filter((h) => h.date !== today()), { date: today(), control: next.control, confidence: next.confidence }]
  }
  return next
}

const Notice = ({ children }: { children: ReactNode }) => <div className="main" style={{ margin: '0 auto' }}>{children}</div>

export function AppProvider({ userId, email, children }: { userId: string; email: string; children: ReactNode }) {
  const { signOut } = useAuth()
  const [state, setState] = useState<AppState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const stateRef = useRef<AppState | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    repo.load(userId).then(
      (s) => { if (!cancelled) { stateRef.current = s; setState(s); setLoadError(null) } },
      (e) => { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Could not load your data') },
    )
    return () => { cancelled = true }
  }, [userId, reloadKey])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const commit = useCallback((next: AppState) => { stateRef.current = next; setState(next) }, [])

  /** Writes run one at a time, in order, so rapid taps on a rating can't land out of order. A failure re-syncs from the server. */
  const persist = useCallback((job: () => Promise<void>): Promise<boolean> => {
    const run = queue.current.then(job).then(
      () => true,
      (e) => {
        console.error(e)
        setToast('Could not save to your account. Restoring your last saved data.')
        setReloadKey((k) => k + 1)
        return false
      },
    )
    queue.current = run.then(() => undefined)
    return run
  }, [])

  const actions = useMemo(() => {
    const cur = () => stateRef.current as AppState
    return {
      notify: setToast,
      saveProfile: (u: Omit<User, 'id'>) => {
        commit({ ...cur(), profile: { ...u, id: userId } })
        void persist(() => repo.saveProfile(userId, u))
      },
      logSession: (input: SessionInput) => {
        const entry: TrainingSession = { ...input, id: `s-${input.date}`, userId, createdAt: new Date().toISOString() }
        const s = cur()
        commit({ ...s, sessions: [...s.sessions.filter((x) => x.date !== input.date), entry] })
        void persist(() => repo.saveSession(userId, entry))
      },
      deleteSession: (id: string) => {
        const s = cur()
        const target = s.sessions.find((x) => x.id === id)
        if (!target) return
        commit({ ...s, sessions: s.sessions.filter((x) => x.id !== id) })
        void persist(() => repo.deleteSession(userId, target.date))
      },
      updateSkill: (skillId: string, patch: SkillPatch) => {
        const s = cur()
        const next = applySkillPatch(s.userSkills[skillId] ?? blankSkill(skillId), patch)
        commit({ ...s, userSkills: { ...s.userSkills, [skillId]: next } })
        void persist(() => repo.saveSkill(userId, next))
      },
      setNextSkill: (id: string | null) => {
        commit({ ...cur(), nextSkillId: id })
        void persist(() => repo.saveNextSkill(userId, id))
      },
      acceptChallenge: (id: string) => {
        const s = cur()
        const uc = { challengeId: id, startedOn: today(), progress: 0 }
        commit({ ...s, userChallenges: { ...s.userChallenges, [id]: uc } })
        void persist(() => repo.saveChallenge(userId, uc))
      },
      addChallengeProgress: (id: string, amount: number) => {
        const s = cur()
        const prev = s.userChallenges[id]
        if (!prev) return
        const uc = { ...prev, progress: Math.max(0, prev.progress + amount) }
        commit({ ...s, userChallenges: { ...s.userChallenges, [id]: uc } })
        void persist(() => repo.saveChallenge(userId, uc))
      },
      addCustomChallenge: (input: ChallengeInput) => {
        const c: Challenge = { ...input, id: uuid(), custom: true }
        const s = cur()
        commit({ ...s, customChallenges: [...s.customChallenges, c] })
        void persist(() => repo.saveCustomChallenge(userId, c))
      },
      updateCustomChallenge: (id: string, input: ChallengeInput) => {
        const s = cur()
        const prev = s.customChallenges.find((c) => c.id === id)
        if (!prev) return
        const c: Challenge = { ...prev, ...input }
        commit({ ...s, customChallenges: s.customChallenges.map((x) => (x.id === id ? c : x)) })
        void persist(() => repo.saveCustomChallenge(userId, c))
      },
      deleteCustomChallenge: (id: string) => {
        const s = cur()
        commit({
          ...s,
          customChallenges: s.customChallenges.filter((c) => c.id !== id),
          userChallenges: Object.fromEntries(Object.entries(s.userChallenges).filter(([k]) => k !== id)),
        })
        void persist(() => repo.deleteCustomChallenge(userId, id))
      },
      addHealth: (m: Omit<HealthMetric, 'id' | 'date'>) => {
        const s = cur()
        const date = today()
        const entry: HealthMetric = { ...s.health.find((h) => h.date === date), ...m, id: `h-${date}`, date }
        commit({ ...s, health: [...s.health.filter((h) => h.date !== date), entry] })
        void persist(() => repo.saveHealth(userId, entry))
      },
      addAchievement: (body: string) => {
        const s = cur()
        const entry: Achievement = { id: uuid(), date: today(), body, createdAt: new Date().toISOString() }
        commit({ ...s, achievements: [entry, ...s.achievements] })
        void persist(() => repo.saveAchievement(userId, entry))
      },
      deleteAchievement: (id: string) => {
        const s = cur()
        commit({ ...s, achievements: s.achievements.filter((a) => a.id !== id) })
        void persist(() => repo.deleteAchievement(userId, id))
      },
      saveWeekPlan: (plan: WeekPlan) => {
        const s = cur()
        commit({ ...s, plans: { ...s.plans, [plan.weekStart]: plan } })
        void persist(() => repo.saveWeekPlan(userId, plan))
      },
      resetData: (mode: 'demo' | 'empty') => {
        const base = mode === 'demo' ? seedState() : emptyState()
        const next: AppState = {
          ...base,
          sessions: base.sessions.map((x) => ({ ...x, userId })),
          achievements: base.achievements.map((a) => ({ ...a, id: uuid() })),
          profile: cur().profile,
        }
        commit(next)
        void persist(async () => {
          await repo.clearAll(userId)
          if (mode === 'demo') await repo.upsertAll(userId, next)
        })
      },
      importLocalData: async () => {
        const legacy = readLegacyState()
        if (!legacy) return false
        const s = cur()
        const incoming: AppState = {
          profile: null,
          sessions: (legacy.sessions ?? []).filter((l) => !s.sessions.some((x) => x.date === l.date)).map((x) => ({ ...x, userId })),
          userSkills: Object.fromEntries(Object.entries(legacy.userSkills ?? {}).filter(([id]) => !s.userSkills[id])),
          userChallenges: Object.fromEntries(Object.entries(legacy.userChallenges ?? {}).filter(([id]) => !s.userChallenges[id])),
          customChallenges: [],
          health: (legacy.health ?? []).filter((l) => !s.health.some((x) => x.date === l.date)),
          achievements: [],
          plans: {},
          nextSkillId: s.nextSkillId ? null : legacy.nextSkillId ?? null,
        }
        commit({
          ...s,
          sessions: [...s.sessions, ...incoming.sessions],
          userSkills: { ...s.userSkills, ...incoming.userSkills },
          userChallenges: { ...s.userChallenges, ...incoming.userChallenges },
          health: [...s.health, ...incoming.health],
          nextSkillId: s.nextSkillId ?? incoming.nextSkillId,
        })
        const ok = await persist(() => repo.upsertAll(userId, incoming))
        if (ok) clearLegacyState()
        return ok
      },
    }
  }, [userId, commit, persist])

  const value = useMemo<Ctx | null>(() => (state ? { ...actions, state, toast, userEmail: email } : null), [actions, state, toast, email])

  if (loadError) {
    return (
      <Notice>
        <h1>Couldn't load your data</h1>
        <p className="mute" style={{ margin: '8px 0 20px' }}>{loadError}</p>
        <div className="row"><button className="btn" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
          <button className="btn ghost" onClick={() => void signOut()}>Log out</button></div>
      </Notice>
    )
  }
  if (!value) return <Notice><p className="mute" role="status">Loading your training log…</p></Notice>
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
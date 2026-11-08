import type { Achievement, AppState, Challenge, ChallengeStatus, HealthMetric, Milestone, MilestoneProgress, Skill, TrainingDuration, TrainingSession, TrainingStatus, TrainingType, UserChallenge, UserSkill } from '../types'
import { EFFORT_SCORE, FEEL_SCORE, MINUTES, TOOLS } from '../lib/options'
import { addDays, parse, weekStart } from './date'
import { MILESTONES } from '../data/seed'

export const isActive = (s: TrainingSession) => s.status === 'completed' || s.status === 'partial'
const byDate = (ss: TrainingSession[]) => new Map(ss.map((s) => [s.date, s]))

/** Streak rule: completed/partial days extend it, a logged rest day holds it, a missed or unlogged day breaks it. */
export function calculateCurrentStreak(sessions: TrainingSession[], now: string): number {
  if (!sessions.length) return 0
  const map = byDate(sessions)
  const earliest = sessions.reduce((m, s) => (s.date < m ? s.date : m), now)
  let cursor = map.has(now) ? now : addDays(now, -1)
  let n = 0
  while (cursor >= earliest) {
    const st = map.get(cursor)?.status
    if (st === 'completed' || st === 'partial') n++
    else if (st !== 'rest') break
    cursor = addDays(cursor, -1)
  }
  return n
}

export function calculateLongestStreak(sessions: TrainingSession[]): number {
  if (!sessions.length) return 0
  const map = byDate(sessions)
  const dates = sessions.map((s) => s.date).sort()
  let cur = 0, best = 0
  for (let d = dates[0]; d <= dates[dates.length - 1]; d = addDays(d, 1)) {
    const st = map.get(d)?.status
    if (st === 'completed' || st === 'partial') best = Math.max(best, ++cur)
    else if (st !== 'rest') cur = 0
  }
  return best
}

export interface PeriodStats { sessions: number; minutes: number; consistency: number; avgEffort: number | null }

export function calculatePeriodStats(sessions: TrainingSession[], from: string, to: string, expected: number): PeriodStats {
  const inRange = sessions.filter((s) => s.date >= from && s.date <= to && isActive(s))
  const efforts = inRange.flatMap((s) => (s.effort ? [EFFORT_SCORE[s.effort]] : []))
  return {
    sessions: inRange.length,
    minutes: calculateTrainingMinutes(inRange),
    consistency: Math.min(100, Math.round((inRange.length / Math.max(1, expected)) * 100)),
    avgEffort: efforts.length ? efforts.reduce((a, b) => a + b, 0) / efforts.length : null,
  }
}
export const calculateWeeklyConsistency = (ss: TrainingSession[], now: string, target: number) =>
  calculatePeriodStats(ss, weekStart(now), addDays(weekStart(now), 6), target)
export function calculateMonthlyConsistency(ss: TrainingSession[], now: string, target: number) {
  const d = parse(now)
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const to = `${from.slice(0, 8)}${String(last).padStart(2, '0')}`
  return { from, to, ...calculatePeriodStats(ss, from, to, Math.round((target * last) / 7)) }
}
export const calculateTrainingMinutes = (ss: TrainingSession[]) => ss.reduce((a, s) => a + (s.duration ? MINUTES[s.duration] : 0), 0)
export const calculateAverageEffort = (ss: TrainingSession[]) => calculatePeriodStats(ss, '0000-01-01', '9999-12-31', 1).avgEffort

export const calculateSkillsAcquired = (us: Record<string, UserSkill>) => Object.values(us).filter((u) => u.learned).length
export const calculateSkillsProgressed = (us: Record<string, UserSkill>, from: string, to: string) =>
  Object.values(us).filter((u) => u.history.some((h) => h.date >= from && h.date <= to)).length
export const calculateNewSkills = (us: Record<string, UserSkill>, from: string, to: string) =>
  Object.values(us).filter((u) => u.learned && u.learnedOn && u.learnedOn >= from && u.learnedOn <= to)

export type SkillState = 'not-started' | 'learning' | 'comfortable' | 'confident' | 'mastered'
/** Confidence alone drives the visible state; control is tracked separately. */
export function skillState(u?: UserSkill): SkillState {
  if (!u || !u.learned) return 'not-started'
  return (['learning', 'learning', 'learning', 'comfortable', 'confident', 'mastered'] as const)[u.confidence]
}
export const SKILL_STATE_LABEL: Record<SkillState, string> = {
  'not-started': 'Not started', learning: 'Learning', comfortable: 'Comfortable', confident: 'Confident', mastered: 'Mastered',
}

export function calculateMilestoneProgress(skills: Skill[], state: AppState): MilestoneProgress[] {
  const learned = (s: Skill) => state.userSkills[s.id]?.learned
  const done = state.sessions.filter((s) => s.status === 'completed')
  const found = skills.filter((s) => s.level === 'foundation')
  const measure: Record<string, [number, number]> = {
    'first-rts': [Math.min(1, done.filter((s) => s.trainingType === 'rts').length), 1],
    'ten-sessions': [Math.min(10, done.length), 10],
    'first-rotational': [Math.min(1, skills.filter((s) => s.rotational && learned(s)).length), 1],
    'first-flow': [Math.min(1, skills.filter((s) => s.level !== 'foundation' && learned(s)).length), 1],
    'foundation-complete': [found.filter(learned).length, found.length],
    'advanced-level': [Object.values(state.userSkills).some((u) => u.learned && u.expertise !== 'beginner') ? 1 : 0, 1],
    'thirty-day': [Math.min(30, calculateLongestStreak(state.sessions)), 30],
  }
  return MILESTONES.map((m: Milestone) => {
    const [current, target] = measure[m.id]
    return { ...m, current, target, status: current >= target ? 'completed' : current > 0 ? 'in-progress' : 'locked' }
  })
}

export function calculateChallengeProgress(c: Challenge, uc?: UserChallenge): { status: ChallengeStatus; pct: number } {
  if (!uc) return { status: 'available', pct: 0 }
  const pct = Math.min(100, Math.round((uc.progress / c.target) * 100))
  return { pct, status: uc.progress >= c.target ? 'completed' : uc.progress > 0 ? 'in-progress' : 'accepted' }
}


// ---- Insights: series for the charts on My Progress ----

export interface WeekBucket { from: string; to: string }
/** The last `n` Monday–Sunday weeks, oldest first, ending with the week containing `now`. */
export const weekBuckets = (now: string, n: number): WeekBucket[] =>
  Array.from({ length: n }, (_, i) => {
    const from = addDays(weekStart(now), (i - (n - 1)) * 7)
    return { from, to: addDays(from, 6) }
  })

const inWeek = (x: { date: string }, w: WeekBucket) => x.date >= w.from && x.date <= w.to
const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null)

export type TypeMixRow = { from: string } & Record<TrainingType, number>
export function calculateTypeMix(sessions: TrainingSession[], weeks: WeekBucket[]): TypeMixRow[] {
  return weeks.map((w) => {
    const row: TypeMixRow = { from: w.from, 'indian-clubs': 0, 'rope-flow': 0, mace: 0, rts: 0 }
    sessions.forEach((s) => { if (isActive(s) && s.trainingType && inWeek(s, w)) row[s.trainingType]++ })
    return row
  })
}

export const calculateConsistencySeries = (ss: TrainingSession[], weeks: WeekBucket[], target: number) =>
  weeks.map((w) => ({ from: w.from, consistency: calculatePeriodStats(ss, w.from, w.to, target).consistency }))

export interface FeelRow { from: string; energy: number | null; movement: number | null; recovery: number | null }
/** Weekly averages of the how-you-felt answers on a 1–3 scale; null for weeks without active sessions. */
export function calculateFeelSeries(sessions: TrainingSession[], weeks: WeekBucket[]): FeelRow[] {
  const avg = (ws: TrainingSession[], pick: (s: TrainingSession) => number | undefined) =>
    mean(ws.flatMap((s) => { const v = pick(s); return v === undefined ? [] : [v] }))
  return weeks.map((w) => {
    const ws = sessions.filter((s) => isActive(s) && inWeek(s, w))
    return {
      from: w.from,
      energy: avg(ws, (s) => s.energy && FEEL_SCORE.energy[s.energy]),
      movement: avg(ws, (s) => s.movement && FEEL_SCORE.movement[s.movement]),
      recovery: avg(ws, (s) => s.recovery && FEEL_SCORE.recovery[s.recovery]),
    }
  })
}

export interface DiscomfortRow { from: string; mild: number; moderate: number; significant: number }
export function calculateDiscomfortSeries(sessions: TrainingSession[], weeks: WeekBucket[]): DiscomfortRow[] {
  return weeks.map((w) => {
    const row: DiscomfortRow = { from: w.from, mild: 0, moderate: 0, significant: 0 }
    sessions.forEach((s) => { if (isActive(s) && inWeek(s, w) && s.painLevel && s.painLevel !== 'none') row[s.painLevel]++ })
    return row
  })
}

export function calculateStatusMix(sessions: TrainingSession[], from: string, to: string): Record<TrainingStatus, number> {
  const out: Record<TrainingStatus, number> = { completed: 0, partial: 0, rest: 0, missed: 0 }
  sessions.forEach((s) => { if (s.date >= from && s.date <= to) out[s.status]++ })
  return out
}

/** Active sessions per weekday, Monday first. */
export function calculateWeekdayPattern(sessions: TrainingSession[], from: string, to: string): number[] {
  const out = [0, 0, 0, 0, 0, 0, 0]
  sessions.forEach((s) => { if (isActive(s) && s.date >= from && s.date <= to) out[(parse(s.date).getDay() + 6) % 7]++ })
  return out
}

export function calculateDurationMix(sessions: TrainingSession[], from: string, to: string): Record<TrainingDuration, number> {
  const out: Record<TrainingDuration, number> = { lt15: 0, '15-30': 0, '30-45': 0, '45-60': 0, '60plus': 0 }
  sessions.forEach((s) => { if (isActive(s) && s.duration && s.date >= from && s.date <= to) out[s.duration]++ })
  return out
}

export function calculateToolProgress(skills: Skill[], us: Record<string, UserSkill>) {
  return TOOLS.map(({ value, label }) => {
    const all = skills.filter((s) => s.tool === value)
    const learned = all.filter((s) => us[s.id]?.learned).length
    return { name: label, learned, remaining: all.length - learned }
  })
}

export const calculateChallengeRows = (challenges: Challenge[], uc: Record<string, UserChallenge>) =>
  challenges.filter((c) => uc[c.id]).map((c) => ({ name: c.name, pct: calculateChallengeProgress(c, uc[c.id]).pct }))

export const calculateAchievementSeries = (list: Achievement[], weeks: WeekBucket[]) =>
  weeks.map((w) => ({ from: w.from, posts: list.filter((a) => inWeek(a, w)).length }))

export type HealthKey = 'sleepHours' | 'restingHr' | 'steps' | 'weightKg'
export const calculateHealthSeries = (health: HealthMetric[], key: HealthKey, from: string) =>
  health
    .filter((h) => h.date >= from && h[key] !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((h) => ({ date: h.date, value: h[key] as number }))
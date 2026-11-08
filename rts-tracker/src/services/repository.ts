import type { Achievement, AppState, Challenge, HealthMetric, TrainingSession, User, UserChallenge, UserSkill, WeekPlan } from '../types'
import { supabase } from '../lib/supabase'

/** The only place that knows about Supabase tables. Components never import the client. */
export interface AppRepository {
  load(userId: string): Promise<AppState>
  saveProfile(userId: string, p: Omit<User, 'id'>): Promise<void>
  saveNextSkill(userId: string, skillId: string | null): Promise<void>
  saveSession(userId: string, s: TrainingSession): Promise<void>
  deleteSession(userId: string, date: string): Promise<void>
  saveSkill(userId: string, u: UserSkill): Promise<void>
  saveChallenge(userId: string, c: UserChallenge): Promise<void>
  saveCustomChallenge(userId: string, c: Challenge): Promise<void>
  /** Server-side trigger removes the challenge's progress in the same transaction. */
  deleteCustomChallenge(userId: string, id: string): Promise<void>
  saveHealth(userId: string, h: HealthMetric): Promise<void>
  saveAchievement(userId: string, a: Achievement): Promise<void>
  deleteAchievement(userId: string, id: string): Promise<void>
  saveWeekPlan(userId: string, p: WeekPlan): Promise<void>
  upsertAll(userId: string, s: AppState): Promise<void>
  clearAll(userId: string): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>
const fail = (error: { message: string } | null) => { if (error) throw new Error(error.message) }
const opt = <T>(v: T | null | undefined): T | undefined => v ?? undefined
const num = (v: unknown): number | undefined => (v == null ? undefined : Number(v))

const sessionRow = (userId: string, s: TrainingSession): Row => ({
  user_id: userId, date: s.date, status: s.status, training_type: s.trainingType ?? null, duration: s.duration ?? null,
  effort: s.effort ?? null, energy: s.energy ?? null, movement: s.movement ?? null, recovery: s.recovery ?? null,
  pain_level: s.painLevel ?? null, pain_location: s.painLocation || null, highlight: s.highlight || null, created_at: s.createdAt,
})
const skillRow = (userId: string, u: UserSkill): Row => ({
  user_id: userId, skill_id: u.skillId, learned: u.learned, expertise: u.expertise, control: u.control, confidence: u.confidence,
  notes: u.notes, learned_on: u.learnedOn ?? null, history: u.history,
})
const challengeRow = (userId: string, c: UserChallenge): Row => ({ user_id: userId, challenge_id: c.challengeId, started_on: c.startedOn, progress: c.progress })
const customRow = (userId: string, c: Challenge): Row => ({
  id: c.id, user_id: userId, name: c.name, category: c.category, level: c.level, description: c.description, target: c.target, unit: c.unit,
  exercise: c.exercise, reps: c.reps ?? null, time_min: c.timeMin ?? null, weight_kg: c.weightKg ?? null,
})
const healthRow = (userId: string, h: HealthMetric): Row => ({
  user_id: userId, date: h.date, sleep_hours: h.sleepHours ?? null, resting_hr: h.restingHr ?? null, steps: h.steps ?? null, weight_kg: h.weightKg ?? null,
})

const achievementRow = (userId: string, a: Achievement): Row => ({ id: a.id, user_id: userId, date: a.date, body: a.body, created_at: a.createdAt })
const planRow = (userId: string, p: WeekPlan): Row => ({ user_id: userId, week_start: p.weekStart, focus: p.focus, days: p.days })

const toSession = (r: Row): TrainingSession => ({
  id: `s-${r.date}`, userId: r.user_id, date: r.date, status: r.status, trainingType: opt(r.training_type), duration: opt(r.duration),
  effort: opt(r.effort), energy: opt(r.energy), movement: opt(r.movement), recovery: opt(r.recovery), painLevel: opt(r.pain_level),
  painLocation: opt(r.pain_location), highlight: opt(r.highlight), createdAt: r.created_at,
})
const toSkill = (r: Row): UserSkill => ({
  skillId: r.skill_id, learned: r.learned, expertise: r.expertise, control: r.control, confidence: r.confidence,
  notes: r.notes ?? '', learnedOn: opt(r.learned_on), history: Array.isArray(r.history) ? r.history : [],
})
const toCustom = (r: Row): Challenge => ({
  id: r.id, name: r.name, category: r.category, level: r.level, description: r.description ?? '', target: Number(r.target), unit: r.unit, custom: true,
  exercise: r.exercise || r.name, reps: num(r.reps), timeMin: num(r.time_min), weightKg: num(r.weight_kg),
})
const toHealth = (r: Row): HealthMetric => ({
  id: `h-${r.date}`, date: r.date, sleepHours: opt(r.sleep_hours), restingHr: opt(r.resting_hr), steps: opt(r.steps), weightKg: opt(r.weight_kg),
})

const toAchievement = (r: Row): Achievement => ({ id: r.id, date: r.date, body: r.body, createdAt: r.created_at })
const toPlan = (r: Row): WeekPlan => ({ weekStart: r.week_start, focus: r.focus ?? '', days: Array.isArray(r.days) ? r.days : [] })

const upsert = async (table: string, rows: Row[], onConflict: string) => {
  if (!rows.length) return
  fail((await supabase.from(table).upsert(rows, { onConflict })).error)
}

export const repository: AppRepository = {
  async load(userId) {
    const [p, ss, sk, ch, hm, cc, ac, wp] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('training_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('user_skills').select('*').eq('user_id', userId),
      supabase.from('user_challenges').select('*').eq('user_id', userId),
      supabase.from('health_metrics').select('*').eq('user_id', userId),
      supabase.from('custom_challenges').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('achievements').select('*').eq('user_id', userId).order('date', { ascending: false }).order('created_at', { ascending: false }).limit(500),
      supabase.from('week_plans').select('*').eq('user_id', userId),
    ])
    for (const r of [p, ss, sk, ch, hm, cc, ac, wp]) fail(r.error)
    const pr = p.data as Row | null
    return {
      profile: pr && {
        id: pr.id, name: pr.name, email: pr.email, mobile: pr.mobile, dob: opt(pr.dob), gender: pr.gender, city: pr.city,
        photo: opt(pr.photo), goals: pr.goals ?? [], program: pr.program, weeklyTarget: pr.weekly_target, heightCm: opt(pr.height_cm),
      },
      nextSkillId: pr?.next_skill_id ?? null,
      sessions: (ss.data as Row[]).map(toSession),
      userSkills: Object.fromEntries((sk.data as Row[]).map(toSkill).map((u) => [u.skillId, u])),
      userChallenges: Object.fromEntries((ch.data as Row[]).map((r) => [r.challenge_id, { challengeId: r.challenge_id, startedOn: r.started_on, progress: Number(r.progress) }])),
      customChallenges: (cc.data as Row[]).map(toCustom),
      health: (hm.data as Row[]).map(toHealth),
      achievements: (ac.data as Row[]).map(toAchievement),
      plans: Object.fromEntries((wp.data as Row[]).map(toPlan).map((x) => [x.weekStart, x])),
    }
  },

  async saveProfile(userId, p) {
    // next_skill_id is deliberately omitted so editing the profile never overwrites it.
    await upsert('profiles', [{
      id: userId, name: p.name, email: p.email, mobile: p.mobile, dob: p.dob || null, gender: p.gender, city: p.city,
      photo: p.photo ?? null, goals: p.goals, program: p.program, weekly_target: p.weeklyTarget, height_cm: p.heightCm ?? null,
    }], 'id')
  },
  async saveNextSkill(userId, skillId) { fail((await supabase.from('profiles').update({ next_skill_id: skillId }).eq('id', userId)).error) },
  saveSession: (userId, s) => upsert('training_sessions', [sessionRow(userId, s)], 'user_id,date'),
  async deleteSession(userId, date) { fail((await supabase.from('training_sessions').delete().eq('user_id', userId).eq('date', date)).error) },
  saveSkill: (userId, u) => upsert('user_skills', [skillRow(userId, u)], 'user_id,skill_id'),
  saveChallenge: (userId, c) => upsert('user_challenges', [challengeRow(userId, c)], 'user_id,challenge_id'),
  saveCustomChallenge: (userId, c) => upsert('custom_challenges', [customRow(userId, c)], 'id'),
  async deleteCustomChallenge(userId, id) { fail((await supabase.from('custom_challenges').delete().eq('user_id', userId).eq('id', id)).error) },
  saveHealth: (userId, h) => upsert('health_metrics', [healthRow(userId, h)], 'user_id,date'),
  saveAchievement: (userId, a) => upsert('achievements', [achievementRow(userId, a)], 'id'),
  async deleteAchievement(userId, id) { fail((await supabase.from('achievements').delete().eq('user_id', userId).eq('id', id)).error) },
  saveWeekPlan: (userId, p) => upsert('week_plans', [planRow(userId, p)], 'user_id,week_start'),

  async upsertAll(userId, s) {
    await upsert('training_sessions', s.sessions.map((x) => sessionRow(userId, x)), 'user_id,date')
    await upsert('user_skills', Object.values(s.userSkills).map((x) => skillRow(userId, x)), 'user_id,skill_id')
    await upsert('user_challenges', Object.values(s.userChallenges).map((x) => challengeRow(userId, x)), 'user_id,challenge_id')
    await upsert('custom_challenges', s.customChallenges.map((x) => customRow(userId, x)), 'id')
    await upsert('health_metrics', s.health.map((x) => healthRow(userId, x)), 'user_id,date')
    await upsert('achievements', s.achievements.map((x) => achievementRow(userId, x)), 'id')
    await upsert('week_plans', Object.values(s.plans).map((x) => planRow(userId, x)), 'user_id,week_start')
    if (s.nextSkillId) await this.saveNextSkill(userId, s.nextSkillId)
  },

  async clearAll(userId) {
    for (const table of ['training_sessions', 'user_skills', 'user_challenges', 'custom_challenges', 'health_metrics', 'achievements', 'week_plans']) {
      fail((await supabase.from(table).delete().eq('user_id', userId)).error)
    }
    await this.saveNextSkill(userId, null)
  },
}
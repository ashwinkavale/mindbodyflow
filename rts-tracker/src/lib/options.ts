import type * as T from '../types'

type Opt<V extends string> = { value: V; label: string }

export const STATUS: Opt<T.TrainingStatus>[] = [
  { value: 'completed', label: 'Completed' }, { value: 'partial', label: 'Partial' },
  { value: 'rest', label: 'Rest day' }, { value: 'missed', label: 'Missed' },
]
export const TOOLS: Opt<T.Tool>[] = [
  { value: 'indian-clubs', label: 'Indian Clubs' }, { value: 'rope-flow', label: 'Rope Flow' }, { value: 'mace', label: 'Mace' },
]
export const TRAINING_TYPES: Opt<T.TrainingType>[] = [...TOOLS, { value: 'rts', label: 'RTS' }]
export const PLAN_TYPES: Opt<T.PlanType>[] = [...TRAINING_TYPES, { value: 'rest', label: 'Rest day' }]
export const CHALLENGE_CATEGORIES: Opt<T.ChallengeCategory>[] = [
  ...TOOLS, { value: 'bodyweight', label: 'Body weight' }, { value: 'other', label: 'Other activity' },
]
export const DURATION: Opt<T.TrainingDuration>[] = [
  { value: 'lt15', label: '<15 min' }, { value: '15-30', label: '15–30 min' }, { value: '30-45', label: '30–45 min' },
  { value: '45-60', label: '45–60 min' }, { value: '60plus', label: '60+ min' },
]
export const EFFORT: Opt<T.EffortLevel>[] = [
  { value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' }, { value: 'high', label: 'High intensity' },
]
export const ENERGY: Opt<T.EnergyLevel>[] = [{ value: 'low', label: 'Low' }, { value: 'good', label: 'Good' }, { value: 'high', label: 'High' }]
export const MOVEMENT: Opt<T.MovementLevel>[] = [{ value: 'stiff', label: 'Stiff' }, { value: 'normal', label: 'Normal' }, { value: 'fluid', label: 'Fluid' }]
export const RECOVERY: Opt<T.RecoveryLevel>[] = [{ value: 'poor', label: 'Poor' }, { value: 'okay', label: 'Okay' }, { value: 'good', label: 'Good' }]
export const PAIN: Opt<T.PainLevel>[] = [
  { value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'significant', label: 'Significant' },
]
export const GOALS: Opt<T.Goal>[] = [
  { value: 'skills', label: 'Learn movement skills' }, { value: 'fitness', label: 'Improve fitness' },
  { value: 'mobility', label: 'Improve mobility' }, { value: 'strength', label: 'Build strength' },
  { value: 'sport', label: 'Support my sport' }, { value: 'quality', label: 'Improve movement quality' },
  { value: 'wellbeing', label: 'General health & wellbeing' },
]
export const GENDERS: Opt<T.Gender>[] = [
  { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' }, { value: 'undisclosed', label: 'Prefer not to say' },
]
export const EXPERTISE: Opt<T.Expertise>[] = [
  { value: 'beginner', label: 'Beginner' }, { value: 'advanced', label: 'Advanced' }, { value: 'integrated', label: 'Integrated' },
]

export const MINUTES: Record<T.TrainingDuration, number> = { lt15: 10, '15-30': 23, '30-45': 38, '45-60': 53, '60plus': 70 }
/** Effort is scored 2–5 so the weekly average reads on the brief's "/ 5" scale. */
export const EFFORT_SCORE: Record<T.EffortLevel, number> = { easy: 2, moderate: 3, challenging: 4, high: 5 }

/** How-you-felt answers scored 1–3 so they can be averaged and charted. */
export const FEEL_SCORE = {
  energy: { low: 1, good: 2, high: 3 },
  movement: { stiff: 1, normal: 2, fluid: 3 },
  recovery: { poor: 1, okay: 2, good: 3 },
} as const

export const CONFIDENCE_SCALE = ['', '😕 Not yet', '😐 Learning', '🙂 Comfortable', '😃 Confident', '🔥 Mastered']
export const label = <V extends string>(opts: Opt<V>[], v?: V) => opts.find((o) => o.value === v)?.label ?? ''

export const planText = (d: T.PlanDay) =>
  [label(PLAN_TYPES, d.type), d.type && d.type !== 'rest' ? label(DURATION, d.duration) : '', d.note].filter(Boolean).join(' · ')

type Spec = Pick<T.Challenge, 'exercise' | 'reps' | 'timeMin' | 'weightKg'>

/** Progress counts reps when the challenge has them, otherwise minutes. */
export const withTarget = <C extends Pick<T.Challenge, 'reps' | 'timeMin'>>(c: C): C & { target: number; unit: string } =>
  c.reps ? { ...c, target: c.reps, unit: 'reps' } : { ...c, target: c.timeMin ?? 1, unit: 'min' }

export const challengeSpec = (c: Spec) =>
  [c.exercise, c.reps ? `${c.reps} reps` : '', c.weightKg ? `${c.weightKg} kg` : '', c.timeMin ? `${c.timeMin} min` : ''].filter(Boolean)

/** Default title when the user leaves the name blank, e.g. "50 Push-ups (10 kg in 5 min)". */
export function challengeTitle(c: Spec): string {
  const lead = c.reps ? `${c.reps} ` : c.timeMin ? `${c.timeMin} min ` : ''
  const tail = [c.weightKg ? `${c.weightKg} kg` : '', c.reps && c.timeMin ? `in ${c.timeMin} min` : ''].filter(Boolean).join(' ')
  return `${lead}${c.exercise}${tail ? ` (${tail})` : ''}`.slice(0, 80)
}
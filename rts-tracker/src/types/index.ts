export type TrainingStatus = 'completed' | 'partial' | 'rest' | 'missed'
export type Tool = 'indian-clubs' | 'rope-flow' | 'mace'
export type TrainingType = Tool | 'rts'
export type TrainingDuration = 'lt15' | '15-30' | '30-45' | '45-60' | '60plus'
export type EffortLevel = 'easy' | 'moderate' | 'challenging' | 'high'
export type EnergyLevel = 'low' | 'good' | 'high'
export type MovementLevel = 'stiff' | 'normal' | 'fluid'
export type RecoveryLevel = 'poor' | 'okay' | 'good'
export type PainLevel = 'none' | 'mild' | 'moderate' | 'significant'
export type SkillLevel = 'foundation' | 'flow' | 'integrated'
export type Expertise = 'beginner' | 'advanced' | 'integrated'
export type Rating = 0 | 1 | 2 | 3 | 4 | 5
export type Goal = 'skills' | 'fitness' | 'mobility' | 'strength' | 'sport' | 'quality' | 'wellbeing'
export type Gender = 'female' | 'male' | 'non-binary' | 'undisclosed'

export interface User {
  id: string
  name: string
  mobile: string
  email: string
  dob?: string
  gender: Gender
  city: string
  photo?: string
  goals: Goal[]
  program: Tool
  weeklyTarget: number
  heightCm?: number
}

export interface TrainingSession {
  id: string
  userId: string
  date: string
  status: TrainingStatus
  trainingType?: TrainingType
  duration?: TrainingDuration
  effort?: EffortLevel
  energy?: EnergyLevel
  movement?: MovementLevel
  recovery?: RecoveryLevel
  painLevel?: PainLevel
  painLocation?: string
  highlight?: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  tool: Tool
  category: string
  level: SkillLevel
  rotational: boolean
}

export interface SkillRating { date: string; control: Rating; confidence: Rating }

export interface UserSkill {
  skillId: string
  learned: boolean
  expertise: Expertise
  control: Rating
  confidence: Rating
  notes: string
  learnedOn?: string
  history: SkillRating[]
}

export interface Milestone { id: string; title: string; description: string }
export interface MilestoneProgress extends Milestone { current: number; target: number; status: 'locked' | 'in-progress' | 'completed' }

export type ChallengeCategory = Tool | 'bodyweight' | 'other'

export interface Challenge {
  id: string
  name: string
  category: ChallengeCategory
  level: 1 | 2 | 3
  description: string
  exercise: string
  reps?: number
  timeMin?: number
  weightKg?: number
  /** What progress is counted in: reps when set, otherwise minutes. Always derived from reps / timeMin via withTarget(). */
  target: number
  unit: string
  /** True for challenges the user created; built-ins live in code. */
  custom?: boolean
}
export type ChallengeInput = Omit<Challenge, 'id' | 'custom'>
export interface UserChallenge { challengeId: string; startedOn: string; progress: number }
export type ChallengeStatus = 'available' | 'accepted' | 'in-progress' | 'completed'

export interface HealthMetric {
  id: string
  date: string
  sleepHours?: number
  restingHr?: number
  steps?: number
  weightKg?: number
}

export interface Achievement { id: string; date: string; body: string; createdAt: string }

export type PlanType = TrainingType | 'rest'
export interface PlanDay { type?: PlanType; duration?: TrainingDuration; note: string }
export interface WeekPlan { weekStart: string; focus: string; days: PlanDay[] }

export interface AppState {
  profile: User | null
  sessions: TrainingSession[]
  userSkills: Record<string, UserSkill>
  nextSkillId: string | null
  userChallenges: Record<string, UserChallenge>
  customChallenges: Challenge[]
  health: HealthMetric[]
  achievements: Achievement[]
  /** Keyed by the Monday of the week the plan is for. */
  plans: Record<string, WeekPlan>
}
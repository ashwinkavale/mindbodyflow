import type { AppState, Challenge, HealthMetric, Milestone, Skill, SkillLevel, Tool, TrainingSession, UserSkill, Rating } from '../types'
import { withTarget } from '../lib/options'
import { addDays, daysAgo, today, weekStart } from '../utils/date'

const PREFIX: Record<Tool, string> = { 'indian-clubs': 'ic', 'rope-flow': 'rf', mace: 'mc' }
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function group(tool: Tool, category: string, level: SkillLevel, names: string[]): Skill[] {
  return names.map((name) => ({
    id: `${PREFIX[tool]}-${slug(name)}`, name, tool, category, level,
    rotational: level === 'foundation' && /circle|roll|parikrama|windmill|matador/i.test(name),
  }))
}

export const SKILLS: Skill[] = [
  ...group('indian-clubs', 'Foundational movements with single club', 'foundation', ['Front Circles', 'Back Circles', 'Wrist Circles', 'Heart Circles', 'Reverse Heart Circles']),
  ...group('indian-clubs', 'Flow movements', 'flow', ['Heart Circle + Wrist Flow', 'Front / Back Circle + Wrist Flow', 'Reverse Heart Wrist Flow']),
  ...group('indian-clubs', 'Double hand flows', 'integrated', ['Cross Circles', 'Cross + Heart + Wrist Flow', 'Async Heart Flow', 'Reverse Heart Flow']),
  ...group('rope-flow', 'Foundational movements', 'foundation', ['Underhand Sneak', 'Overhand Sneak', 'Side Circles', 'Overhand Matador', 'Dragon Roll', 'Dragon Head']),
  ...group('rope-flow', 'Integrated flows', 'integrated', ['Dragon Roll + Dragon Head', 'Overhand Matador to Underhand Matador']),
  ...group('mace', 'Foundation', 'foundation', ['10/2', 'Parikrama', 'Windmill Flow']),
  ...group('mace', 'Integrated flows', 'integrated', ['Power Flow', 'Warrior Flow']),
]

export const MILESTONES: Milestone[] = [
  { id: 'first-rts', title: 'First RTS Session', description: 'Complete a session logged as RTS.' },
  { id: 'ten-sessions', title: '10 Sessions Completed', description: 'Log 10 sessions with the status Completed.' },
  { id: 'first-rotational', title: 'First Rotational Skill', description: 'Mark a circling or rolling foundation skill as learned.' },
  { id: 'first-flow', title: 'First Continuous Flow', description: 'Learn any flow or integrated skill.' },
  { id: 'foundation-complete', title: 'Foundation Completed', description: 'Learn every foundation skill across all three tools.' },
  { id: 'advanced-level', title: 'Advanced Level', description: 'Raise any learned skill to Advanced or Integrated.' },
  { id: 'thirty-day', title: '30-Day Consistency', description: 'Train on 30 days in a row. Rest days hold the streak; missed days break it.' },
]

type ChallengeSpec = Omit<Challenge, 'target' | 'unit'>
const SPECS: ChallengeSpec[] = [
  { id: 'ch-heart-50', name: '50 Heart Circles', category: 'indian-clubs', level: 1, exercise: 'Heart Circles', reps: 50, description: 'Fifty clean heart circles with Indian Clubs. Split across sessions if you need to.' },
  { id: 'ch-rope-15', name: '15 min non-stop Rope Flow', category: 'rope-flow', level: 2, exercise: 'Rope Flow', timeMin: 15, description: 'Keep the rope moving for fifteen minutes in total, without dropping into rest.' },
  { id: 'ch-parikrama-100', name: '100 Parikrama with weighted Mace', category: 'mace', level: 3, exercise: 'Parikrama', reps: 100, weightKg: 5, description: 'One hundred Parikrama with a 5 kg mace.' },
  { id: 'ch-pushups-50', name: '50 Push-ups', category: 'bodyweight', level: 1, exercise: 'Push-ups', reps: 50, description: 'Fifty strict push-ups. Split across sets and sessions.' },
  { id: 'ch-squats-100', name: '100 Bodyweight Squats', category: 'bodyweight', level: 1, exercise: 'Squats', reps: 100, description: 'One hundred full-depth squats, any number of sets.' },
  { id: 'ch-plank-5', name: '5 min Plank', category: 'bodyweight', level: 2, exercise: 'Plank', timeMin: 5, description: 'Five minutes of plank holds in total. Stop a hold when form goes.' },
  { id: 'ch-pullups-20', name: '20 Pull-ups', category: 'bodyweight', level: 2, exercise: 'Pull-ups', reps: 20, description: 'Twenty pull-ups, chin over the bar, across as many sets as you need.' },
  { id: 'ch-wpushups-50', name: '50 Weighted Push-ups (10 kg)', category: 'bodyweight', level: 3, exercise: 'Weighted Push-ups', reps: 50, weightKg: 10, description: 'Fifty push-ups wearing a 10 kg pack or vest.' },
  { id: 'ch-burpees-100', name: '100 Burpees in 10 min', category: 'bodyweight', level: 3, exercise: 'Burpees', reps: 100, timeMin: 10, description: 'One hundred burpees. Aim to finish inside ten minutes; log reps as you go.' },
  { id: 'ch-run-30', name: '30 min Run', category: 'other', level: 1, exercise: 'Running', timeMin: 30, description: 'Thirty minutes of running in total, at a pace you can hold a conversation at.' },
  { id: 'ch-yoga-60', name: '60 min Yoga', category: 'other', level: 2, exercise: 'Yoga', timeMin: 60, description: 'One hour of yoga across the week.' },
  { id: 'ch-swim-60', name: '60 min Swim', category: 'other', level: 3, exercise: 'Swimming', timeMin: 60, description: 'Sixty minutes in the water, any stroke, any number of sessions.' },
]
export const CHALLENGES: Challenge[] = SPECS.map(withTarget)

type Row = [number, TrainingSession['status'], TrainingSession['trainingType']?, TrainingSession['duration']?, TrainingSession['effort']?, string?, string?]
const ROWS: Row[] = [
  [1, 'completed', 'indian-clubs', '30-45', 'moderate'], [2, 'completed', 'rope-flow', '15-30', 'challenging', undefined, 'First clean overhand matador.'],
  [3, 'partial', 'rts', 'lt15', 'easy'], [4, 'rest'], [5, 'completed', 'rts', '45-60', 'challenging'],
  [6, 'completed', 'mace', '30-45', 'moderate', 'left wrist'], [7, 'completed', 'indian-clubs', '15-30', 'moderate'],
  [9, 'missed'], [10, 'completed', 'rope-flow', '30-45', 'high'], [11, 'completed', 'rts', '30-45', 'challenging'],
  [12, 'completed', 'indian-clubs', '30-45', 'moderate'], [14, 'completed', 'mace', '45-60', 'challenging'],
  [15, 'partial', 'rope-flow', 'lt15', 'easy'], [17, 'completed', 'rts', '30-45', 'moderate'], [19, 'completed', 'indian-clubs', '15-30', 'easy'],
]

function sessions(userId: string): TrainingSession[] {
  const energy = ['good', 'high', 'low', 'good'] as const
  const movement = ['normal', 'fluid', 'stiff', 'normal'] as const
  const recovery = ['okay', 'good', 'poor', 'good'] as const
  return ROWS.map(([ago, status, trainingType, duration, effort, pain, highlight], i) => {
    const date = daysAgo(ago)
    const active = status === 'completed' || status === 'partial'
    return {
      id: `s-${date}`, userId, date, status, createdAt: `${date}T07:00:00.000Z`, highlight,
      ...(active && { trainingType, duration, effort, energy: energy[i % 4], movement: movement[i % 4], recovery: recovery[i % 4], painLevel: pain ? 'mild' as const : 'none' as const, painLocation: pain }),
    }
  })
}

function seedSkill(skillId: string, control: Rating, confidence: Rating, learnedAgo: number, updatedAgo: number): UserSkill {
  const first: Rating = Math.max(1, control - 1) as Rating
  const firstC: Rating = Math.max(1, confidence - 1) as Rating
  return {
    skillId, learned: true, expertise: 'beginner', control, confidence, notes: '',
    learnedOn: daysAgo(learnedAgo),
    history: [{ date: daysAgo(learnedAgo), control: first, confidence: firstC }, { date: daysAgo(updatedAgo), control, confidence }],
  }
}

const ACHIEVEMENTS: [number, string][] = [
  [0, 'Held a clean heart circle flow for two full minutes without a reset.'],
  [2, 'Showed up on a low-energy day and still got through the rope session.'],
  [6, 'Finally linked underhand sneak into side circles.'],
  [11, 'First week with four sessions.'],
]

function health(): HealthMetric[] {
  const sleep = [6.5, 7, 6, 7.5, 7, 8, 7.5], hr = [64, 63, 64, 62, 62, 61, 60]
  const steps = [6200, 8400, 5100, 9800, 7300, 11200, 8600], kg = [72.4, 72.2, 72.3, 72, 71.9, 71.9, 71.7]
  return [12, 10, 8, 6, 4, 2, 0].map((ago, i) => ({ id: `h-${daysAgo(ago)}`, date: daysAgo(ago), sleepHours: sleep[i], restingHr: hr[i], steps: steps[i], weightKg: kg[i] }))
}

function nextWeekPlan(): AppState['plans'] {
  const week = addDays(weekStart(today()), 7)
  return {
    [week]: {
      weekStart: week,
      focus: 'Clean up heart circle flow; one long mace day.',
      days: [
        { type: 'indian-clubs', duration: '30-45', note: 'Heart circle + wrist flow' }, { type: 'rope-flow', duration: '15-30', note: '' },
        { type: 'rest', note: '' }, { type: 'mace', duration: '45-60', note: 'Parikrama volume' },
        { type: 'rts', duration: '30-45', note: '' }, { note: '' }, { type: 'rest', note: '' },
      ],
    },
  }
}

export function seedState(): AppState {
  const list = [
    seedSkill('ic-front-circles', 4, 4, 40, 9), seedSkill('ic-back-circles', 3, 3, 33, 12), seedSkill('ic-wrist-circles', 4, 4, 28, 5),
    seedSkill('ic-heart-circles', 3, 2, 12, 2), seedSkill('rf-underhand-sneak', 3, 3, 21, 8), seedSkill('rf-overhand-sneak', 2, 2, 10, 2),
    seedSkill('rf-side-circles', 4, 3, 6, 6),
  ]
  return {
    profile: null,
    sessions: sessions('me'),
    userSkills: Object.fromEntries(list.map((u) => [u.skillId, u])),
    nextSkillId: 'ic-heart-circle-wrist-flow',
    userChallenges: {
      'ch-heart-50': { challengeId: 'ch-heart-50', startedOn: daysAgo(6), progress: 32 },
      'ch-pushups-50': { challengeId: 'ch-pushups-50', startedOn: daysAgo(4), progress: 20 },
      'ch-plank-5': { challengeId: 'ch-plank-5', startedOn: daysAgo(3), progress: 2 },
      'ch-run-30': { challengeId: 'ch-run-30', startedOn: daysAgo(9), progress: 30 },
    },
    customChallenges: [],
    health: health(),
    achievements: ACHIEVEMENTS.map(([ago, body], i) => ({ id: `seed-${i}`, date: daysAgo(ago), body, createdAt: `${daysAgo(ago)}T0${8 + i}:00:00.000Z` })),
    plans: nextWeekPlan(),
  }
}

export const emptyState = (): AppState => ({ profile: null, sessions: [], userSkills: {}, nextSkillId: null, userChallenges: {}, customChallenges: [], health: [], achievements: [], plans: {} })
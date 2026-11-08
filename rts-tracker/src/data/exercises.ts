import type { ChallengeCategory } from '../types'
import { SKILLS } from './seed'

/** Names offered when creating a challenge, on top of the skills library. Free text is always allowed. */
const EXTRA: Record<ChallengeCategory, string[]> = {
  'indian-clubs': ['Inside Mills', 'Outside Mills', 'Swipes', 'Shoulder Cast', 'Figure Eights'],
  'rope-flow': ['Figure Eights', 'Butterfly', 'Snake', 'Overhead Circles', 'Hip Circles'],
  mace: ['360 Swing', 'Shield Cast', 'Uppercut', 'Gravedigger', 'Mace Pullover', 'Barbarian Squat'],
  bodyweight: [
    'Push-ups', 'Diamond Push-ups', 'Pike Push-ups', 'Decline Push-ups', 'Pull-ups', 'Chin-ups', 'Inverted Rows', 'Dips',
    'Squats', 'Jump Squats', 'Pistol Squats', 'Lunges', 'Glute Bridges', 'Burpees', 'Mountain Climbers', 'Jumping Jacks',
    'Sit-ups', 'Leg Raises', 'Plank', 'Side Plank', 'Hollow Hold', 'L-Sit', 'Wall Sit', 'Handstand Hold', 'Bear Crawl',
  ],
  other: [
    'Running', 'Brisk Walking', 'Hiking', 'Cycling', 'Swimming', 'Rowing', 'Skipping', 'Stair Climbing',
    'Yoga', 'Mobility Work', 'Stretching', 'Badminton', 'Football', 'Cricket',
  ],
}

export const exercisesFor = (c: ChallengeCategory): string[] =>
  [...new Set([...SKILLS.filter((s) => s.tool === c).map((s) => s.name), ...EXTRA[c]])]
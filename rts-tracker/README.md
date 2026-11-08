# RTS Tracker

Training log and skill tracker for Indian Clubs, Rope Flow and Mace.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

First launch loads a small sample history so every screen has something to show. Settings → Clear all data starts empty.

## Where things live

- `src/utils/calc.ts` – every derived number (streaks, consistency, skill state, milestone and challenge progress). Screens never compute metrics inline.
- `src/services/repository.ts` – the single persistence seam (localStorage today). Implement `AppRepository` against Supabase and swap it in; no component changes.
- `src/app/store.tsx` – app state and actions (`useApp()`).
- `src/data/seed.ts` – skill library, milestone and challenge definitions, sample sessions.
- `src/features/*` – one folder per screen.

## Rules worth knowing

- **Streak**: completed/partial days extend it, a logged rest day holds it, a missed or unlogged day breaks it. 30-Day Consistency uses the longest such run.
- **Effort** scores Easy 2 → High 5 so the average reads as "/ 5".
- **Skill state** comes from confidence only (Learning 1–2, Comfortable 3, Confident 4, Mastered 5); control is separate. Rating a skill marks it learned.
- Milestones are computed from stored sessions and skills; nothing is stored as "unlocked".

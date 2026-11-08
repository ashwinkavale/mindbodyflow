import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './Shell'
import { useAuth } from './auth'
import { AppProvider } from './store'
import { AuthPage } from '../features/auth/AuthPage'
import { OnboardingPage } from '../features/auth/OnboardingPage'
import { TodayPage } from '../features/today/TodayPage'
import { ProgressPage } from '../features/progress/ProgressPage'
import { SkillsPage, SkillDetail } from '../features/skills/SkillsPages'
import { NextStepPage } from '../features/skills/NextStepPage'
import { MilestonesPage } from '../features/milestones/MilestonesPage'
import { ChallengesPage } from '../features/challenges/ChallengesPage'
import { ProfilePage, SettingsPage } from '../features/profile/ProfilePages'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <div className="main" style={{ margin: '0 auto' }}><p className="mute" role="status">Loading…</p></div>

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AppProvider key={session.user.id} userId={session.user.id} email={session.user.email ?? ''}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<Shell />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/:skillId" element={<SkillDetail />} />
          <Route path="/next-step" element={<NextStepPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </AppProvider>
  )
}
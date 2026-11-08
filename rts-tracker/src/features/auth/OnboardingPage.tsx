import { Navigate } from 'react-router-dom'
import { useApp } from '../../app/store'
import { useAuth } from '../../app/auth'
import { ProfileForm } from '../profile/ProfileForm'

export function OnboardingPage() {
  const { state, saveProfile, notify, userEmail } = useApp()
  const { signOut } = useAuth()
  if (state.profile) return <Navigate to="/today" replace />
  return (
    <div className="main" style={{ margin: '0 auto' }}>
      <h1>Set up your profile</h1>
      <p className="mute" style={{ margin: '4px 0 24px' }}>This tailors your goals and weekly target.</p>
      <div className="card"><ProfileForm lockedEmail={userEmail} submitLabel="Save profile" onSave={(u) => { saveProfile(u); notify('Profile saved') }} /></div>
      <p style={{ marginTop: 16 }}><button className="btn ghost" onClick={() => void signOut()}>Log out</button></p>
    </div>
  )
}
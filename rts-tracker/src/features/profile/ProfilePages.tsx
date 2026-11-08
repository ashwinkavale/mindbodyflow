import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/store'
import { useAuth } from '../../app/auth'
import { readLegacyState } from '../../services/legacyLocal'
import { PageHead, Segmented } from '../../components/ui'
import { useTheme, type ThemeMode } from '../../hooks/useTheme'
import { SKILLS } from '../../data/seed'
import { GOALS, TOOLS, label } from '../../lib/options'
import { calculateAverageEffort, calculateCurrentStreak, calculateLongestStreak, calculateSkillsAcquired, calculateTrainingMinutes, isActive } from '../../utils/calc'
import { today } from '../../utils/date'
import { HealthMetrics } from '../health/HealthMetrics'
import { ProfileForm } from './ProfileForm'

const THEMES: { value: ThemeMode; label: string }[] = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'Match device' }]

export function ProfilePage() {
  const { state, saveProfile, notify, userEmail } = useApp()
  const [editing, setEditing] = useState(false)
  const p = state.profile!
  const active = state.sessions.filter(isActive)
  const avg = calculateAverageEffort(active)
  const learned = SKILLS.filter((s) => state.userSkills[s.id]?.learned)

  return (
    <div className="stack">
      <PageHead title="Profile" right={<Link className="btn ghost" to="/settings">Settings</Link>} />
      <section className="card">
        {editing ? <ProfileForm initial={p} lockedEmail={userEmail} submitLabel="Save changes" onSave={(u) => { saveProfile(u); setEditing(false); notify('Profile updated') }} /> : (
          <div className="stack">
            <div className="row">{p.photo ? <img className="avatar" src={p.photo} alt="" /> : <div className="avatar">{p.name[0]?.toUpperCase()}</div>}
              <div className="grow"><h2>{p.name}</h2><p className="mute">{p.city} · {label(TOOLS, p.program)}</p></div>
              <button className="btn ghost" onClick={() => setEditing(true)}>Edit</button></div>
            <p className="mute">{p.email} · {p.mobile}{p.dob ? ` · born ${p.dob}` : ''}</p>
            <div className="chips">{p.goals.map((g) => <span key={g} className="badge">{label(GOALS, g)}</span>)}</div>
          </div>)}
      </section>
      <section className="card"><h3 style={{ marginBottom: 12 }}>Training statistics</h3>
        <div className="stats">
          <div className="stat"><b>{active.length}</b><span>Sessions</span></div><div className="stat"><b>{Math.round(calculateTrainingMinutes(active) / 60)}</b><span>Hours trained</span></div>
          <div className="stat"><b>{calculateCurrentStreak(state.sessions, today())}</b><span>Current streak</span></div><div className="stat"><b>{calculateLongestStreak(state.sessions)}</b><span>Longest streak</span></div>
          <div className="stat"><b>{avg ? avg.toFixed(1) : '–'}</b><span>Average effort</span></div></div></section>
      <section className="card"><h3>Skills acquired · {calculateSkillsAcquired(state.userSkills)}</h3>
        {learned.length ? <div className="chips" style={{ marginTop: 10 }}>{learned.map((s) => <Link key={s.id} className="chip" to={`/skills/${s.id}`}>{s.name}</Link>)}</div>
          : <p className="mute" style={{ marginTop: 6 }}>Your skill journey starts here. <Link to="/skills"><b>Explore the library</b></Link>.</p>}</section>
      <HealthMetrics />
    </div>
  )
}

export function SettingsPage() {
  const { state, saveProfile, resetData, importLocalData, notify, userEmail } = useApp()
  const { signOut } = useAuth()
  const [legacy, setLegacy] = useState(readLegacyState)
  const [importing, setImporting] = useState(false)
  const doImport = async () => {
    setImporting(true)
    const ok = await importLocalData()
    setImporting(false)
    if (ok) { setLegacy(null); notify('Data imported to your account') }
  }
  const { mode, setMode } = useTheme()
  const p = state.profile!
  return (
    <div className="stack">
      <PageHead title="Settings" />
      <section className="card"><Segmented label="Theme" value={mode} options={THEMES} onChange={setMode} /></section>
      <section className="card"><label className="field"><span className="field-label">Height in cm (used only for BMI)</span>
        <input className="input" style={{ maxWidth: 160 }} type="number" min={0} defaultValue={p.heightCm ?? ''}
          onBlur={(e) => { const n = Number(e.target.value); saveProfile({ ...p, heightCm: n > 0 ? n : undefined }); notify('Height saved') }} /></label></section>
      <section className="card stack"><h3>Your data</h3>
        <p className="mute">Your data is stored in your account. Resetting cannot be undone.</p>
        <div className="row">
          <button className="btn ghost" onClick={() => window.confirm('Replace your data with the sample set?') && (resetData('demo'), notify('Sample data restored'))}>Load sample data</button>
          <button className="btn danger" onClick={() => window.confirm('Delete all sessions, skills and challenges?') && (resetData('empty'), notify('Data cleared'))}>Clear all data</button></div></section>
      {legacy && (
        <section className="card stack"><h3>Data from this browser</h3>
          <p className="mute">Found {legacy.sessions?.length ?? 0} sessions and {Object.keys(legacy.userSkills ?? {}).length} skills saved here before accounts existed. If you never cleared the sample data, that is what this is. Importing only adds what your account doesn't have yet.</p>
          <div><button className="btn ghost" disabled={importing} onClick={() => void doImport()}>{importing ? 'Importing…' : 'Import into my account'}</button></div></section>
      )}
      <section className="card row" style={{ justifyContent: 'space-between' }}><p className="mute">Signed in as {userEmail}</p>
        <button className="btn ghost" onClick={() => void signOut()}>Log out</button></section>
    </div>
  )
}
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/auth'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const signup = mode === 'signup'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const addr = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(addr)) return setError('Enter a valid email address.')
    if (signup && password.length < 8) return setError('Use at least 8 characters for your password.')
    if (!password) return setError('Enter your password.')
    setBusy(true)
    try {
      if (signup) {
        const { needsConfirmation } = await signUp(addr, password)
        if (needsConfirmation) setSentTo(addr)
      } else {
        await signIn(addr, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <div className="main" style={{ margin: '0 auto' }}>
        <h1>Check your inbox</h1>
        <p className="mute" style={{ margin: '8px 0 20px' }}>If {sentTo} can be registered, a confirmation link is on its way. Open it, then log in.</p>
        <Link className="btn" to="/login" style={{ display: 'inline-block' }}>Go to log in</Link>
      </div>
    )
  }

  return (
    <div className="main" style={{ margin: '0 auto', maxWidth: 460 }}>
      <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mute" style={{ margin: '4px 0 24px' }}>{signup ? 'Your training log is saved to your account.' : 'Log in to see your training log.'}</p>
      <form className="card stack" onSubmit={submit} noValidate>
        <label className="field"><span className="field-label">Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field"><span className="field-label">Password</span>
          <input className="input" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'One moment…' : signup ? 'Create account' : 'Log in'}</button>
      </form>
      <p style={{ marginTop: 16 }}>
        {signup ? <>Already have an account? <Link to="/login"><b>Log in</b></Link></> : <>New here? <Link to="/signup"><b>Create an account</b></Link></>}
      </p>
    </div>
  )
}
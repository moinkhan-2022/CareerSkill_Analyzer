import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export default function GoogleAuthButton() {
  const { loginWithGoogle, configured } = useAuth()
  const [error, setError] = useState('')
  async function handleLogin() {
    if (!configured) return setError('Firebase is not configured yet. Add the web settings to client/.env.')
    try { setError(''); await loginWithGoogle() } catch (loginError) {
      setError(loginError.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : 'Google sign-in could not be completed.')
    }
  }
  return <div><button type="button" className="secondary-button w-full" onClick={handleLogin}><span className="font-bold text-cyan-300">G</span> Sign in with Google</button>{error && <p className="error-text">{error}</p>}</div>
}

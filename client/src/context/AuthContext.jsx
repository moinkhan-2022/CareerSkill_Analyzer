import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseConfigured } from '../config/firebase'
import { signInWithGoogle, signOutUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!firebaseConfigured) { setLoading(false); return undefined }
    let settled = false
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      settled = true
      setUser(nextUser)
      setLoading(false)
    }, () => {
      settled = true
      setUser(null)
      setLoading(false)
    })
    const timeout = window.setTimeout(() => {
      if (!settled) {
        setUser(null)
        setLoading(false)
      }
    }, 8000)
    return () => { window.clearTimeout(timeout); unsubscribe() }
  }, [])
  return <AuthContext.Provider value={{ user, loading, configured: firebaseConfigured, loginWithGoogle: signInWithGoogle, logout: signOutUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

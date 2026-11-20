import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseConfigured } from '../config/firebase'
import { signInWithGoogle, signOutUser } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!firebaseConfigured)

  useEffect(() => {
    if (!firebaseConfigured) return undefined

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

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: firebaseConfigured,
      loginWithGoogle: signInWithGoogle,
      logout: signOutUser,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

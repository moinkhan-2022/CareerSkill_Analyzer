import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from './GoogleAuthButton'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <main className="mx-auto max-w-3xl px-5 py-20 text-center"><p className="page-copy mx-auto">Checking authentication...</p></main>
  if (!user) return <main className="mx-auto max-w-md px-5 py-20"><div className="surface"><h1 className="section-title">Authentication required</h1><p className="page-copy">Continue with Google to view your saved analyses.</p><GoogleAuthButton /></div></main>
  return <Outlet />
}

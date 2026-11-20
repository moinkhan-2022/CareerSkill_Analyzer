import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import GoogleAuthButton from './GoogleAuthButton'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <main className="mx-auto max-w-3xl px-5 py-20 text-center"><p className="page-copy mx-auto">Checking status...</p></main>
  }

  return <>
    <Outlet />
    {!user && <div className="mx-auto mt-4 max-w-md px-5"><div className="surface"><h2 className="section-title">Guest mode</h2><p className="page-copy">You can still use the app without an account. Sign in with Google anytime to save your profile.</p><GoogleAuthButton /></div></div>}
  </>
}

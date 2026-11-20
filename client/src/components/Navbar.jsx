import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import GoogleAuthButton from './GoogleAuthButton'

export default function Navbar() {
  const { user, logout } = useAuth()

  return <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link to="/analyze" className="text-lg font-semibold tracking-tight text-white">Career<span className="text-cyan-300">Skill</span> AI</Link>
      <nav className="flex items-center gap-4">
        <NavLink to="/analyze" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}>Analyze</NavLink>
        {user ? (
          <>
            <NavLink to="/my-analyses" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}>My Analyses</NavLink>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5">
              <img src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email || 'User') + '&background=0ea5e9&color=fff'} alt={user.displayName || 'Profile'} className="h-8 w-8 rounded-full object-cover" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm font-medium text-white">{user.displayName || user.email || 'Google User'}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">Logged in</span>
              </div>
            </div>
            <button type="button" className="text-sm text-slate-400 hover:text-white" onClick={logout}>Logout</button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-cyan-300">G</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm font-medium text-white">Guest</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Not signed in</span>
              </div>
            </div>
            <div className="w-44"><GoogleAuthButton /></div>
          </div>
        )}
      </nav>
    </div>
  </header>
}

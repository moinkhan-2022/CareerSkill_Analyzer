import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from './GoogleAuthButton'

export default function Navbar() {
  const { user, logout } = useAuth()
  return <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link to="/analyze" className="text-lg font-semibold tracking-tight text-white">Career<span className="text-cyan-300">Skill</span> AI</Link>
      <nav className="flex items-center gap-5"><NavLink to="/analyze" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}>Analyze</NavLink>{user ? <><NavLink to="/my-analyses" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}>My Analyses</NavLink><span className="hidden text-sm text-slate-400 sm:inline">{user.displayName || user.email}</span><button type="button" className="text-sm text-slate-400 hover:text-white" onClick={logout}>Logout</button></> : <div className="w-48"><GoogleAuthButton /></div>}</nav>
    </div>
  </header>
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMyAnalyses } from '../services/api'

export default function MyAnalyses() {
  const [analyses, setAnalyses] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getMyAnalyses().then((response) => setAnalyses(response.data)).catch(() => setError('Unable to load your analyses. Please try again.')) }, [])
  return <><Navbar /><main className="mx-auto max-w-5xl px-5 py-12 lg:py-16"><p className="eyebrow">Your workspace</p><h1 className="page-title">My Analyses</h1><p className="page-copy">Your saved career analysis inputs, ready to revisit.</p>{error && <p className="error-text mt-8">{error}</p>}{analyses === null && !error && <p className="mt-8 text-slate-400">Loading analyses...</p>}{analyses?.length === 0 && <section className="surface mt-8 text-center"><h2 className="section-title">No analyses yet</h2><p className="page-copy mx-auto">Upload your resume and analyze your first job description.</p><Link to="/analyze" className="primary-button mx-auto mt-6 max-w-xs">Analyze a Job</Link></section>}<div className="mt-8 grid gap-5 md:grid-cols-2">{analyses?.map((analysis) => <article className="surface" key={analysis.id}><p className="text-xs uppercase tracking-widest text-cyan-300/70">Saved analysis</p><h2 className="section-title mt-3">{analysis.targetRole}</h2><p className="mt-3 text-sm text-slate-400">{analysis.availableDays} days x {analysis.hoursPerDay} hours/day</p><p className="mt-1 text-sm text-slate-400">{analysis.totalAvailableHours} total hours</p><Link to={`/results/${analysis.id}`} className="secondary-button mt-6">View Analysis</Link></article>)}</div></main></>
}

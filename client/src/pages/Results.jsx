import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getAnalysisById } from '../services/api'

const placeholderDays = ['Foundations', 'Practice', 'Build', 'Review', 'Project']

function List({ title, items }) {
  return <div><h3 className="mini-heading">{title}</h3><p className="tag-list">{items?.length ? items.join(', ') : 'None found'}</p></div>
}

export default function Results() {
  const { id } = useParams()
  const location = useLocation()
  const [analysis, setAnalysis] = useState(location.state?.analysisData || null)
  const [error, setError] = useState('')
  const [showResumeText, setShowResumeText] = useState(false)

  useEffect(() => {
    if (location.state?.analysisData) return
    getAnalysisById(id).then((response) => setAnalysis(response.data)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load this analysis. Please try again.'))
  }, [id, location.state])

  if (error) return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="page-title">{error}</h1><Link to="/analyze" className="secondary-button mt-8">Back to Analyze</Link></main></>
  if (!analysis) return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-20 text-center"><p className="page-copy mx-auto">Loading analysis...</p></main></>

  const roadmap = Array.from({ length: analysis.availableDays }, (_, index) => placeholderDays[index] || 'Focused practice')
  const resumeInfo = analysis.resumeInformation
  const jdInfo = analysis.jobDescriptionInformation
  return <><Navbar /><main className="mx-auto max-w-6xl px-5 py-12 lg:py-16"><div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow">Persisted analysis / module 06</p><h1 className="page-title">Analysis results</h1><p className="page-copy">Prepared inputs for your <span className="text-white">{analysis.targetRole}</span> journey.</p></div><Link to="/analyze" className="secondary-button">New analysis</Link></div>
  <div className="mt-8 grid gap-5 sm:grid-cols-3"><div className="metric"><span>Match score</span><strong>Not available</strong></div><div className="metric"><span>Availability</span><strong>{analysis.availableDays} days x {analysis.hoursPerDay} hours/day</strong></div><div className="metric"><span>Total time</span><strong>{analysis.totalAvailableHours} hrs</strong></div></div>
  <section className="surface mt-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="section-title">Resume processed</h2><p className="mt-2 text-sm text-emerald-300">&#10003; {analysis.resume.fileName}</p><p className="mt-1 text-sm text-slate-400">Structured information validated by the server.</p></div><button type="button" className="secondary-button" onClick={() => setShowResumeText((visible) => !visible)}>{showResumeText ? 'Hide extracted text' : 'View extracted text'}</button></div>{showResumeText && <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">{analysis.resume.text}</pre>}</section>
  {resumeInfo && <section className="surface mt-5"><h2 className="section-title">Resume extraction</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><List title="Skills" items={resumeInfo.skills} /><List title="Technologies" items={resumeInfo.technologies} /></div></section>}
  {jdInfo && <section className="surface mt-5"><h2 className="section-title">Job description extraction</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><List title="Required skills" items={jdInfo.requiredSkills} /><List title="Responsibilities" items={jdInfo.responsibilities} /></div></section>}
  <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="surface"><h2 className="section-title">Overview</h2><p className="mt-4 text-sm text-slate-400">AI analysis will appear here in a future module.</p></section><section className="surface"><h2 className="section-title">Skill gap</h2><p className="mt-4 text-sm text-slate-400">Skill gap analysis is not available yet.</p></section><section className="surface"><h2 className="section-title">Learning</h2><p className="mt-4 text-sm text-slate-400">Learning recommendations will appear here in a future module.</p></section><section className="surface"><h2 className="section-title">Roadmap</h2><div className="mt-5 space-y-4">{roadmap.map((topic, index) => <div key={`${topic}-${index}`} className="roadmap-item"><span className="day-number">{index + 1}</span><div><h3 className="font-medium text-white">{topic}</h3><p className="mt-1 text-sm text-slate-400">{analysis.hoursPerDay} hours placeholder practice</p></div></div>)}</div></section></div><p className="mt-8 text-center text-xs text-slate-600">Structured extraction only. No skill-gap analysis has been run.</p></main></>
}

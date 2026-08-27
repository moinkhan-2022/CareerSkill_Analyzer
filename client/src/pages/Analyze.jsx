import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyzeButton from '../components/AnalyzeButton'
import Navbar from '../components/Navbar'
import ResumeUpload from '../components/ResumeUpload'
import StudyPreferences from '../components/StudyPreferences'
import { analyzeJob, extractJobDescriptionInformation, extractResume, extractResumeInformation } from '../services/api'
import { analysisSchema, getValidationErrors } from '../validation/analysisSchema'
import { useAuth } from '../context/AuthContext'

export default function Analyze() {
  const navigate = useNavigate()
  const { user, loginWithGoogle } = useAuth()
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [availableDays, setAvailableDays] = useState('7')
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const totalHours = Number(availableDays || 0) * Number(hoursPerDay || 0)

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = analysisSchema.safeParse({ resume, jobDescription, targetRole, availableDays, hoursPerDay })
    if (!validation.success) {
      const errors = getValidationErrors(validation.error)
      setFieldErrors(errors)
      setError(Object.values(errors)[0])
      return
    }

    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      if (!user) await loginWithGoogle()
      let resumeData
      try {
        ({ data: resumeData } = await extractResume(resume))
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to extract text from this resume. Please upload a text-based PDF or DOCX file.')
        return
      }
      setError('')
      let analysisData
      try {
        const [{ data: resumeInformation }, { data: jobDescriptionInformation }] = await Promise.all([extractResumeInformation(resumeData.text), extractJobDescriptionInformation(jobDescription.trim())])
        const saved = await analyzeJob({ resume: resumeData, resumeInformation, jobDescriptionInformation, jobDescription: jobDescription.trim(), targetRole: targetRole.trim(), availableDays: validation.data.availableDays, hoursPerDay: validation.data.hoursPerDay })
        analysisData = saved.data
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Resume extracted, but the analysis could not be saved.')
        return
      }
      navigate(`/results/${analysisData.analysisId}`)
    } catch (requestError) {
      const responseMessage = requestError.response?.data?.message
      setError(responseMessage || (requestError.response ? 'The server could not save this analysis.' : 'The backend is unavailable. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return <><Navbar /><main className="mx-auto max-w-6xl px-5 py-12 lg:py-20"><div className="mb-10 max-w-2xl"><p className="eyebrow">Career intelligence / module 03</p><h1 className="page-title">Analyze your career skill gap</h1><p className="page-copy">Upload your resume and paste a job description to discover your skill gaps and create a personalized learning roadmap.</p></div><form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
    <section className="surface space-y-7"><div><h2 className="section-title">Your starting point</h2><p className="section-copy">Give us the context for your next role.</p></div><ResumeUpload file={resume} onChange={(file) => { setResume(file); setFieldErrors((errors) => ({ ...errors, resume: undefined })) }} /><div><label className="field-label" htmlFor="job-description">Job Description</label><textarea id="job-description" className="field-input min-h-56 resize-y" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the complete job description here..." aria-invalid={Boolean(fieldErrors.jobDescription)} /><div className={`mt-2 text-right text-xs ${jobDescription.length > 10000 ? 'text-rose-300' : 'text-slate-500'}`}>{jobDescription.length} / 10,000</div></div></section>
    <section className="surface flex flex-col space-y-7"><div><h2 className="section-title">Learning preferences</h2><p className="section-copy">Shape the time available for your future roadmap.</p></div><div><label className="field-label" htmlFor="target-role">Target Role</label><input id="target-role" className="field-input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Full Stack Developer" maxLength="100" aria-invalid={Boolean(fieldErrors.targetRole)} /></div><StudyPreferences availableDays={availableDays} hoursPerDay={hoursPerDay} onDaysChange={setAvailableDays} onHoursChange={setHoursPerDay} /><div className="total-time"><span><span className="block text-xs uppercase tracking-widest text-cyan-200/70">Total learning time</span><strong>{totalHours || 0} hours</strong></span><span className="text-right text-sm text-slate-400">{availableDays || 0} days x {hoursPerDay || 0} hours/day</span></div><div className="mt-auto">{error && <p className="error-text mb-4" role="alert">{error}</p>}<AnalyzeButton disabled={!resume || !jobDescription.trim() || !targetRole.trim()} loading={loading} /><p className="mt-3 text-center text-xs text-slate-500">{loading ? 'Processing resume, then validating analysis...' : 'Your roadmap will stay within this available time.'}</p></div></section>
  </form></main></>
}

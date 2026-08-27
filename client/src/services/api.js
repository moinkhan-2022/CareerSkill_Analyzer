import axios from 'axios'
import { auth } from '../config/firebase'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' })
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`
  return config
})

export async function analyzeJob(payload) {
  const response = await api.post('/api/analyze', payload)
  return response.data
}

export async function getAnalysisById(id) {
  const response = await api.get(`/api/analysis/${id}`)
  return response.data
}

export async function getMyAnalyses() {
  const response = await api.get('/api/analyses')
  return response.data
}

export async function extractResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  const response = await api.post('/api/resume/extract', formData)
  return response.data
}

export async function extractResumeInformation(text) {
  const response = await api.post('/api/ai/extract-resume', { text })
  return response.data
}

export async function extractJobDescriptionInformation(text) {
  const response = await api.post('/api/ai/extract-jd', { text })
  return response.data
}

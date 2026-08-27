import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { connectDatabase } from './config/db.js'
import analysisRoutes from './routes/analysisRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/resume', resumeRoutes)
app.use('/api', analysisRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Career Skill Analyzer API is running' })
})

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))
app.use((error, _req, res, _next) => {
  console.error(error)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Resume file must be smaller than 5 MB.' })
  }
  if (error.code === 'INVALID_RESUME_TYPE') {
    return res.status(400).json({ success: false, message: error.message })
  }
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: 'Resume upload could not be processed.' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'The analysis data could not be saved.' })
  }
  return res.status(500).json({ success: false, message: 'Unable to process the resume. Please upload another file.' })
})

async function startServer() {
  try {
    await connectDatabase()
    app.listen(port, () => console.log(`Career Skill Analyzer API listening on port ${port}`))
  } catch (_error) {
    console.error('Server startup aborted because MongoDB is unavailable.')
    process.exitCode = 1
  }
}

startServer()

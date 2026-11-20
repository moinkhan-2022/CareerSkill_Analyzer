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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-ID'],
  exposedHeaders: ['X-Guest-ID'],
  optionsSuccessStatus: 204,
}))
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
  console.error('Request failed:', error?.code || error?.name || 'unknown')
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, stage: 'file_upload', code: error.code, message: 'Resume file must be 5 MB or smaller.' })
  }
  const uploadErrorCodes = new Set(['INVALID_RESUME_TYPE', 'EMPTY_FILE', 'SUSPICIOUS_FILE', 'CORRUPTED_OR_UNSUPPORTED_FILE', 'FILE_TYPE_MISMATCH'])
  if (uploadErrorCodes.has(error.code)) {
    return res.status(400).json({ success: false, stage: 'file_upload', code: error.code, message: error.message })
  }
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, stage: 'file_upload', code: error.code, message: 'Resume upload could not be processed. Use the multipart field named "resume".' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, stage: 'database_saving', code: 'DATABASE_VALIDATION_FAILED', message: 'The analysis data did not pass database validation.' })
  }
  return res.status(500).json({ success: false, code: 'UNEXPECTED_SERVER_ERROR', message: 'An unexpected server error occurred. Please try again.' })
})

async function startServer() {
  try {
    await connectDatabase()
    app.listen(port, () => console.log(`Career Skill Analyzer API listening on port ${port}`))
  } catch (_error) {
    console.error('Server startup aborted because MongoDB is unavailable.')
    process.exit(1)
  }
}

startServer()

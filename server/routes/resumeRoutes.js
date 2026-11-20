import { Router } from 'express'
import { extractResume } from '../controllers/resumeController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { uploadResume, validateResumeUpload } from '../middleware/uploadMiddleware.js'

const router = Router()
router.post('/extract', requireAuth, uploadResume, validateResumeUpload, extractResume)

export default router

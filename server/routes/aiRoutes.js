import { Router } from 'express'
import { extractJobDescription, extractResume } from '../controllers/aiExtractionController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.post('/extract-resume', requireAuth, extractResume)
router.post('/extract-jd', requireAuth, extractJobDescription)

export default router

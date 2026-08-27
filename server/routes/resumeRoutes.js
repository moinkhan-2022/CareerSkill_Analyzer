import { Router } from 'express'
import { extractResume } from '../controllers/resumeController.js'
import { uploadResume } from '../middleware/uploadMiddleware.js'

const router = Router()
router.post('/extract', uploadResume, extractResume)

export default router

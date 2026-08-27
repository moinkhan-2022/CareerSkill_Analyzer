import { Router } from 'express'
import { createAnalysis, getAnalysisById, listAnalyses } from '../controllers/analysisController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.post('/analyze', requireAuth, createAnalysis)
router.get('/analysis/:id', requireAuth, getAnalysisById)
router.get('/analyses', requireAuth, listAnalyses)

export default router

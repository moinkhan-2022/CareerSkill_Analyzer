import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { upsertUser } from '../controllers/userController.js'

const router = Router()
router.get('/me', requireAuth, async (req, res, next) => {
  try { const user = await upsertUser(req.user); res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, photoURL: user.photoURL } }) } catch (error) { next(error) }
})
export default router

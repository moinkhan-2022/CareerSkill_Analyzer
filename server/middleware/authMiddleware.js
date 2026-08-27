import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authentication required.' })
  const adminAuth = getFirebaseAdminAuth()
  if (!adminAuth) return res.status(503).json({ success: false, message: 'Authentication service is not configured.' })
  try {
    req.user = await adminAuth.verifyIdToken(header.slice(7))
    return next()
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' })
  }
}

import { randomUUID } from 'node:crypto'
import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js'

const GUEST_ID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

export function createGuestIdentity(guestId = randomUUID()) {
  return {
    uid: `guest:${guestId}`,
    name: 'Guest',
    email: '',
    picture: '',
    isGuest: true,
  }
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    const suppliedGuestId = req.get('x-guest-id')?.trim()
    if (suppliedGuestId && !GUEST_ID_PATTERN.test(suppliedGuestId)) {
      return res.status(400).json({ success: false, stage: 'authentication', code: 'INVALID_GUEST_ID', message: 'Guest identity is invalid. Refresh the page and try again.' })
    }
    const guestId = suppliedGuestId || randomUUID()
    res.set('X-Guest-ID', guestId)
    req.user = createGuestIdentity(guestId)
    return next()
  }

  const adminAuth = getFirebaseAdminAuth()
  if (!adminAuth) {
    return res.status(503).json({ success: false, stage: 'authentication', code: 'AUTH_NOT_CONFIGURED', message: 'Google authentication is not configured on the server. Continue as a guest or contact the administrator.' })
  }

  try {
    req.user = await adminAuth.verifyIdToken(header.slice(7))
    req.user.isGuest = false
    return next()
  } catch (_error) {
    return res.status(401).json({ success: false, stage: 'authentication', code: 'INVALID_AUTH_TOKEN', message: 'Your Google session is invalid or expired. Sign in again or continue as a guest.' })
  }
}

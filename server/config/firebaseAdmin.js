import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export function getFirebaseAdminAuth() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) return null
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY
  const keyStart = rawPrivateKey.indexOf('-----BEGIN PRIVATE KEY-----')
  const keyEnd = rawPrivateKey.indexOf('-----END PRIVATE KEY-----')
  if (keyStart < 0 || keyEnd < 0) return null
  const privateKey = rawPrivateKey.slice(keyStart, keyEnd + '-----END PRIVATE KEY-----'.length).replace(/\\n/g, '\n')
  const app = getApps()[0] || initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey }) })
  return getAuth(app)
}

import { signInWithRedirect, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

export async function signInWithGoogle() {
  return signInWithRedirect(auth, googleProvider)
}

export function signOutUser() {
  return signOut(auth)
}

export function getCurrentUser() {
  return auth.currentUser
}

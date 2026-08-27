import User from '../models/User.js'

export async function upsertUser(firebaseUser) {
  return User.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    { $set: { name: firebaseUser.name || '', email: firebaseUser.email || '', photoURL: firebaseUser.picture || '' } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
}

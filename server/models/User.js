import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, index: true },
  firebaseUid: { type: String, required: true, unique: true, trim: true },
  photoURL: { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('User', userSchema)

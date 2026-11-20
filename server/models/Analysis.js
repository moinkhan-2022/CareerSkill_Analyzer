import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true, trim: true },
  fileType: { type: String, required: true, enum: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  fileSize: { type: Number, required: true, min: 1 },
  textLength: { type: Number, required: true, min: 1 },
  text: { type: String, required: true, trim: true },
  usedOcr: { type: Boolean, default: false },
  wasTruncated: { type: Boolean, default: false },
}, { _id: false })

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  jobDescription: { type: String, required: true, trim: true, minlength: 50, maxlength: 10000 },
  availableDays: { type: Number, required: true, min: 1, max: 30 },
  hoursPerDay: { type: Number, required: true, min: 1, max: 8 },
  totalAvailableHours: { type: Number, required: true, min: 1 },
  resume: { type: resumeSchema, required: true },
  resumeInformation: { type: mongoose.Schema.Types.Mixed, default: null },
  jobDescriptionInformation: { type: mongoose.Schema.Types.Mixed, default: null },
  overview: { type: mongoose.Schema.Types.Mixed, default: null },
  skillGaps: { type: [mongoose.Schema.Types.Mixed], default: [] },
  learningPlan: { type: [mongoose.Schema.Types.Mixed], default: [] },
  roadmap: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: { createdAt: true, updatedAt: false } })

export default mongoose.model('Analysis', analysisSchema)

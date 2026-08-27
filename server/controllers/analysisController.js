import mongoose from 'mongoose'
import Analysis from '../models/Analysis.js'
import { upsertUser } from './userController.js'
import { analysisSchema } from '../validation/analysisSchema.js'

export async function createAnalysis(req, res, next) {
  const parsed = analysisSchema.safeParse(req.body)
  if (!parsed.success) {
    const errors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
    return res.status(400).json({ success: false, message: 'Invalid analysis input.', errors })
  }

  try {
    const { targetRole, jobDescription, availableDays, hoursPerDay, resume, resumeInformation, jobDescriptionInformation } = parsed.data
    const user = await upsertUser(req.user)
    const analysis = await Analysis.create({
      userId: user._id,
      targetRole,
      jobDescription,
      availableDays,
      hoursPerDay,
      totalAvailableHours: availableDays * hoursPerDay,
      resume,
      resumeInformation,
      jobDescriptionInformation,
    })
    return res.status(200).json({ success: true, message: 'Analysis saved successfully.', data: { analysisId: analysis.id } })
  } catch (error) {
    return next(error)
  }
}

export async function getAnalysisById(req, res, next) {
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid analysis ID.' })
  }

  try {
    const user = await upsertUser(req.user)
    const analysis = await Analysis.findOne({ _id: id, userId: user._id }).select('-__v').lean()
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found.' })
    return res.json({
      success: true,
      data: { id: analysis._id.toString(), ...analysis, _id: undefined },
    })
  } catch (error) {
    return next(error)
  }
}

export async function listAnalyses(req, res, next) {
  try {
    const user = await upsertUser(req.user)
    const analyses = await Analysis.find({ userId: user._id }).select('targetRole availableDays hoursPerDay totalAvailableHours createdAt').sort({ createdAt: -1 }).lean()
    return res.json({ success: true, data: analyses.map(({ _id, ...analysis }) => ({ id: _id.toString(), ...analysis })) })
  } catch (error) {
    return next(error)
  }
}

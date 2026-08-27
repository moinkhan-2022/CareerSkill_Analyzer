import { extractJobDescriptionInformation, extractResumeInformation } from '../services/aiExtractionService.js'
import { jobDescriptionTextInputSchema, resumeTextInputSchema } from '../validation/aiExtractionSchemas.js'

async function extract(req, res, next, inputSchema, service, message) {
  const parsed = inputSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid text input.', errors: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message])) })
  }
  try {
    const data = await service(parsed.data.text)
    return res.json({ success: true, message, data })
  } catch (error) {
    if (error.code === 'MISSING_AI_KEY') return res.status(503).json({ success: false, message: 'AI extraction is not configured on the server.' })
    if (error.code === 'INVALID_AI_OUTPUT') return res.status(502).json({ success: false, message: 'Failed to extract structured information.' })
    console.error('AI extraction failed:', error.message)
    return next(error)
  }
}

export function extractResume(req, res, next) {
  return extract(req, res, next, resumeTextInputSchema, extractResumeInformation, 'Resume information extracted successfully.')
}

export function extractJobDescription(req, res, next) {
  return extract(req, res, next, jobDescriptionTextInputSchema, extractJobDescriptionInformation, 'Job description information extracted successfully.')
}

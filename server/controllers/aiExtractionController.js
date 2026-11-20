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
    const responses = {
      MISSING_AI_KEY: [503, 'AI extraction is not configured. Add GEMINI_API_KEY on the server.'],
      INVALID_AI_OUTPUT: [502, 'Gemini returned invalid structured data. Please retry the AI extraction.'],
      AI_SERVICE_UNAVAILABLE: [503, 'Gemini is temporarily unavailable. Please try again in a moment.'],
      AI_RATE_LIMITED: [429, 'Gemini rate limit reached. Wait briefly and try again.'],
      AI_MODEL_NOT_FOUND: [503, 'The configured Gemini model is unavailable. Check GEMINI_MODEL on the server.'],
      AI_AUTH_FAILED: [503, 'Gemini authentication failed. Check the server API key configuration.'],
      AI_NETWORK_ERROR: [503, 'The server could not reach Gemini. Check the server network connection.'],
    }
    if (responses[error.code]) {
      const [status, responseMessage] = responses[error.code]
      return res.status(status).json({ success: false, stage: 'ai_extraction', code: error.code, message: responseMessage })
    }
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

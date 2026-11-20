import { GoogleGenAI } from '@google/genai'
import {
  jobDescriptionExtractionJsonSchema,
  jobDescriptionExtractionSchema,
  resumeExtractionJsonSchema,
  resumeExtractionSchema,
} from '../validation/aiExtractionSchemas.js'

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const MAX_RETRIES = 2
const BASE_RETRY_DELAY_MS = 750
const REQUEST_TIMEOUT_MS = 30000

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.code = 'MISSING_AI_KEY'
    throw error
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: REQUEST_TIMEOUT_MS },
  })
}

export function isRetryableAiFailure(error) {
  const status = Number(error?.status ?? error?.code ?? error?.details?.status ?? error?.response?.status ?? 0)
  const message = `${error?.message || ''} ${error?.details?.message || ''}`.toLowerCase()
  return [429, 500, 502, 503, 504].includes(status) || /unavailable|temporar|overloaded|high demand|rate limit|too many requests|fetch failed|network|timed? ?out/i.test(message)
}

export function normalizeAiError(error) {
  if (error?.code === 'MISSING_AI_KEY' || error?.code === 'INVALID_AI_OUTPUT') {
    return error
  }

  const status = Number(error?.status ?? error?.code ?? error?.details?.status ?? error?.response?.status ?? 0)
  const message = `${error?.message || ''} ${error?.details?.message || ''}`.toLowerCase()

  if (status === 429 || /rate limit|too many requests/i.test(message)) {
    const normalizedError = new Error('Gemini is rate-limited right now. Please try again in a moment.')
    normalizedError.code = 'AI_RATE_LIMITED'
    normalizedError.status = 429
    return normalizedError
  }

  if (status === 404 || /model|not found/i.test(message)) {
    const normalizedError = new Error('Gemini model is not available. Please check GEMINI_MODEL configuration.')
    normalizedError.code = 'AI_MODEL_NOT_FOUND'
    normalizedError.status = 404
    return normalizedError
  }

  if ([400, 401, 403].includes(status) && /api key|permission|unauthenticated|forbidden|credential/i.test(message)) {
    const normalizedError = new Error('Gemini API authentication failed. Check GEMINI_API_KEY.')
    normalizedError.code = 'AI_AUTH_FAILED'
    normalizedError.status = status
    return normalizedError
  }

  if ([500, 502, 503, 504].includes(status) || /unavailable|temporar|overloaded|high demand/i.test(message)) {
    const normalizedError = new Error('Gemini is temporarily unavailable. Please try again in a moment.')
    normalizedError.code = 'AI_SERVICE_UNAVAILABLE'
    normalizedError.status = status || 503
    return normalizedError
  }

  if (/fetch failed|network|econn|enotfound|timed? ?out|abort/i.test(message)) {
    const normalizedError = new Error('The server could not reach Gemini. Check the network connection and try again.')
    normalizedError.code = 'AI_NETWORK_ERROR'
    normalizedError.status = 503
    return normalizedError
  }

  const normalizedError = new Error('The AI service could not complete this extraction.')
  normalizedError.code = 'AI_EXTRACTION_FAILED'
  normalizedError.status = status || 500
  return normalizedError
}

export function parseModelJson(responseText, schema) {
  try {
    if (!responseText?.trim()) throw new Error('Empty AI response')
    return schema.parse(JSON.parse(responseText))
  } catch (error) {
    const controlledError = new Error('The AI returned an invalid structured response.')
    controlledError.code = 'INVALID_AI_OUTPUT'
    controlledError.cause = error
    throw controlledError
  }
}

async function generateJson(prompt, schema, responseJsonSchema) {
  const ai = getClient()
  const model = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim()

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema,
          temperature: 0,
          maxOutputTokens: 4096,
        },
      })
      return parseModelJson(response.text, schema)
    } catch (error) {
      if (!isRetryableAiFailure(error) || attempt >= MAX_RETRIES) {
        throw normalizeAiError(error)
      }

      const delayMs = BASE_RETRY_DELAY_MS * (2 ** attempt)
      await wait(delayMs)
    }
  }

  throw new Error('Gemini did not complete the extraction request.')
}

export function extractResumeInformation(text) {
  return generateJson(`You are a resume information extraction system. Extract only information explicitly present in the supplied resume. Do not infer or invent facts. Use empty arrays or empty strings when information is unavailable. Resume text:\n${text}`, resumeExtractionSchema, resumeExtractionJsonSchema)
}

export function extractJobDescriptionInformation(text) {
  return generateJson(`You are a job description information extraction system. Extract only information explicitly present in the supplied job description. Do not invent requirements. Use empty arrays when information is unavailable. Job description text:\n${text}`, jobDescriptionExtractionSchema, jobDescriptionExtractionJsonSchema)
}

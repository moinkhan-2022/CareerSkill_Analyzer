import { GoogleGenAI } from '@google/genai'
import { jobDescriptionExtractionSchema, resumeExtractionSchema } from '../validation/aiExtractionSchemas.js'

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.code = 'MISSING_AI_KEY'
    throw error
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

function parseModelJson(responseText, schema) {
  try {
    return schema.parse(JSON.parse(responseText))
  } catch (error) {
    const controlledError = new Error('The AI returned an invalid structured response.')
    controlledError.code = 'INVALID_AI_OUTPUT'
    controlledError.cause = error
    throw controlledError
  }
}

async function generateJson(prompt, schema) {
  const ai = getClient()
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0 },
  })
  return parseModelJson(response.text, schema)
}

export function extractResumeInformation(text) {
  return generateJson(`You are a resume information extraction system. Extract only information explicitly present in the supplied resume. Do not infer or invent facts. Return JSON only, without markdown or explanation. Use empty arrays or empty strings when information is unavailable. Match this schema exactly: {"skills":["string"],"projects":[{"name":"string","description":"string"}],"experience":[{"company":"string","role":"string","duration":"string","description":"string"}],"education":[{"degree":"string","institution":"string","year":"string"}],"technologies":["string"]}. Resume text:\n${text}`, resumeExtractionSchema)
}

export function extractJobDescriptionInformation(text) {
  return generateJson(`You are a job description information extraction system. Extract only information explicitly present in the supplied job description. Do not invent requirements. Return JSON only, without markdown or explanation. Use empty arrays when information is unavailable. Match this schema exactly: {"requiredSkills":["string"],"preferredSkills":["string"],"experience":["string"],"responsibilities":["string"],"tools":["string"],"technologies":["string"]}. Job description text:\n${text}`, jobDescriptionExtractionSchema)
}

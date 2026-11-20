import { z } from 'zod'

export const MAX_RESUME_TEXT_LENGTH = 50000
export const MAX_JOB_DESCRIPTION_LENGTH = 10000

export const resumeTextInputSchema = z.object({
  text: z.string().trim().min(50, 'Resume text is too short to analyze.').max(MAX_RESUME_TEXT_LENGTH, `Resume text must be ${MAX_RESUME_TEXT_LENGTH.toLocaleString()} characters or fewer.`),
})

export const jobDescriptionTextInputSchema = z.object({
  text: z.string().trim().min(50, 'Please provide a more detailed job description.').max(MAX_JOB_DESCRIPTION_LENGTH, `Job description must be ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters or fewer.`),
})

export const resumeExtractionSchema = z.object({
  skills: z.array(z.string()),
  projects: z.array(z.object({ name: z.string(), description: z.string() })),
  experience: z.array(z.object({ company: z.string(), role: z.string(), duration: z.string(), description: z.string() })),
  education: z.array(z.object({ degree: z.string(), institution: z.string(), year: z.string() })),
  technologies: z.array(z.string()),
})

export const jobDescriptionExtractionSchema = z.object({
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  experience: z.array(z.string()),
  responsibilities: z.array(z.string()),
  tools: z.array(z.string()),
  technologies: z.array(z.string()),
})

const stringArray = { type: 'array', items: { type: 'string' } }

export const resumeExtractionJsonSchema = {
  type: 'object',
  properties: {
    skills: stringArray,
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, description: { type: 'string' } },
        required: ['name', 'description'],
        additionalProperties: false,
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          duration: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['company', 'role', 'duration', 'description'],
        additionalProperties: false,
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: { degree: { type: 'string' }, institution: { type: 'string' }, year: { type: 'string' } },
        required: ['degree', 'institution', 'year'],
        additionalProperties: false,
      },
    },
    technologies: stringArray,
  },
  required: ['skills', 'projects', 'experience', 'education', 'technologies'],
  additionalProperties: false,
}

export const jobDescriptionExtractionJsonSchema = {
  type: 'object',
  properties: {
    requiredSkills: stringArray,
    preferredSkills: stringArray,
    experience: stringArray,
    responsibilities: stringArray,
    tools: stringArray,
    technologies: stringArray,
  },
  required: ['requiredSkills', 'preferredSkills', 'experience', 'responsibilities', 'tools', 'technologies'],
  additionalProperties: false,
}

import { z } from 'zod'

const textInputSchema = z.object({
  text: z.string().trim().min(1, 'Text is required.').max(30000, 'Text must be 30,000 characters or fewer.'),
})

export const resumeTextInputSchema = textInputSchema
export const jobDescriptionTextInputSchema = textInputSchema

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

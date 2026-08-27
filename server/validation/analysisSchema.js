import { z } from 'zod'

const resumeSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  fileSize: z.number().int().positive(),
  textLength: z.number().int().positive(),
  text: z.string().trim().min(1),
})

export const analysisSchema = z.object({
  resume: resumeSchema,
  jobDescription: z.string().trim().min(50, 'Please provide a more detailed job description.').max(10000, 'Job description is too long. Please keep it under 10,000 characters.'),
  targetRole: z.string().trim().min(2, 'Please enter a valid target role.').max(100, 'Target role must be 100 characters or fewer.'),
  availableDays: z.coerce.number().finite().int().min(1, 'Available days must be between 1 and 30.').max(30, 'Available days must be between 1 and 30.'),
  hoursPerDay: z.coerce.number().finite().int().min(1, 'Hours per day must be between 1 and 8.').max(8, 'Hours per day must be between 1 and 8.'),
  resumeInformation: z.record(z.string(), z.unknown()).nullable().optional(),
  jobDescriptionInformation: z.record(z.string(), z.unknown()).nullable().optional(),
})

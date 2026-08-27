import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export const analysisSchema = z.object({
  resume: z.instanceof(File, { message: 'Please upload your resume.' }).refine((file) => file.size <= MAX_FILE_SIZE, 'Resume file must be smaller than 5 MB.'),
  jobDescription: z.string().trim().min(50, 'Please provide a more detailed job description.').max(10000, 'Job description is too long. Please keep it under 10,000 characters.'),
  targetRole: z.string().trim().min(2, 'Please enter a valid target role.').max(100, 'Target role must be 100 characters or fewer.'),
  availableDays: z.coerce.number().finite().int().min(1, 'Available days must be between 1 and 30.').max(30, 'Available days must be between 1 and 30.'),
  hoursPerDay: z.coerce.number().finite().int().min(1, 'Hours per day must be between 1 and 8.').max(8, 'Hours per day must be between 1 and 8.'),
})

export function getValidationErrors(error) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))
}

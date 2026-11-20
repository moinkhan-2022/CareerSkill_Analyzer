import { extractJobDescriptionInformation } from './services/aiExtractionService.js'
import 'dotenv/config'

process.loadEnvFile('.env')

const text = 'We are seeking a full stack developer with React, Node.js, MongoDB, and REST APIs. Must have JavaScript experience, communicate clearly, and work with teams.'

try {
  const result = await extractJobDescriptionInformation(text)
  console.log('SUCCESS')
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.log('ERROR_CODE=' + (error?.code || 'unknown'))
  console.log('ERROR_MESSAGE=' + (error?.message || 'no message'))
  console.log('ERROR_STATUS=' + (error?.status || 'unknown'))
  process.exitCode = 1
}

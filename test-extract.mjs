import { extractResumeText } from './server/services/resumeParserService.js'
import fs from 'fs'

const pdfBuffer = fs.readFileSync('test.pdf')

async function testPdfExtraction() {
  console.log('Testing PDF extraction...')
  const file = {
    mimetype: 'application/pdf',
    buffer: pdfBuffer,
    originalname: 'test.pdf',
    size: pdfBuffer.length
  }
  
  try {
    const text = await extractResumeText(file)
    console.log('SUCCESS: Extracted text:', text)
  } catch (error) {
    console.log('ERROR:', error.code, error.message)
  }
}

testPdfExtraction()
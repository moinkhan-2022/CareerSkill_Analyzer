import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { cleanExtractedText } from '../utils/textCleaner.js'

const PDF_MIME_TYPE = 'application/pdf'

export async function extractResumeText(file) {
  let extractedText
  if (file.mimetype === PDF_MIME_TYPE) {
    const parser = new PDFParse({ data: file.buffer })
    try {
      const result = await parser.getText()
      extractedText = result.text
    } finally {
      await parser.destroy()
    }
  } else {
    const result = await mammoth.extractRawText({ buffer: file.buffer })
    extractedText = result.value
  }

  const text = cleanExtractedText(extractedText || '')
  if (text.replace(/\s/g, '').length < 50) {
    const error = new Error('Resume text is too short to be useful.')
    error.code = 'EMPTY_EXTRACTION'
    throw error
  }
  return text
}

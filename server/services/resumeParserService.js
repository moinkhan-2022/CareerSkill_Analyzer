import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { createWorker } from 'tesseract.js'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanExtractedText } from '../utils/textCleaner.js'
import { MAX_RESUME_TEXT_LENGTH } from '../validation/aiExtractionSchemas.js'

const PDF_MIME_TYPE = 'application/pdf'
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MIN_TEXT_LENGTH = 40
const MAX_OCR_PAGES = 3
const OCR_IMAGE_WIDTH = 1600
const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function hasMeaningfulResumeText(text) {
  const normalized = cleanExtractedText(text || '')
  const compactLength = normalized.replace(/\s/g, '').length
  const letterCount = (normalized.match(/\p{L}/gu) || []).length
  const wordCount = (normalized.match(/[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu) || []).length
  return compactLength >= MIN_TEXT_LENGTH && letterCount >= 20 && wordCount >= 8
}

function limitText(text) {
  if (text.length <= MAX_RESUME_TEXT_LENGTH) return { text, wasTruncated: false }
  const shortened = text.slice(0, MAX_RESUME_TEXT_LENGTH)
  const lastBreak = shortened.lastIndexOf('\n')
  return {
    text: shortened.slice(0, lastBreak > MAX_RESUME_TEXT_LENGTH * 0.8 ? lastBreak : MAX_RESUME_TEXT_LENGTH).trim(),
    wasTruncated: true,
  }
}

export async function extractPdfWithOcr(parser) {
  let worker
  try {
    const screenshots = await parser.getScreenshot({ first: MAX_OCR_PAGES, desiredWidth: OCR_IMAGE_WIDTH, imageDataUrl: false, imageBuffer: true })
    const localLanguageFile = resolve(serverDirectory, 'eng.traineddata')
    const workerOptions = existsSync(localLanguageFile)
      ? { langPath: serverDirectory, gzip: false, cacheMethod: 'none' }
      : {}
    worker = await createWorker('eng', undefined, workerOptions)
    const pageTexts = []
    for (const page of screenshots.pages) {
      const result = await worker.recognize(Buffer.from(page.data))
      pageTexts.push(result.data.text || '')
    }
    return pageTexts.join('\n')
  } catch (cause) {
    throw Object.assign(new Error('OCR could not read this scanned PDF. Try a clearer scan or a DOCX file.'), { code: 'OCR_FAILED', cause })
  } finally {
    if (worker) await worker.terminate().catch(() => {})
  }
}

function normalizePdfError(error) {
  if (error?.code) return error
  if (error?.name === 'PasswordException' || /password/i.test(error?.message || '')) {
    return Object.assign(new Error('Password-protected PDFs are not supported. Remove the password and upload again.'), { code: 'PDF_PASSWORD_PROTECTED' })
  }
  if (error?.name === 'InvalidPDFException' || /invalid pdf|malformed|corrupt/i.test(error?.message || '')) {
    return Object.assign(new Error('The PDF is corrupted or invalid.'), { code: 'CORRUPTED_PDF' })
  }
  return Object.assign(new Error('The PDF text extraction stage failed.'), { code: 'PDF_EXTRACTION_FAILED', cause: error })
}

async function extractTextFromPdf(buffer, ocrExtractor = extractPdfWithOcr) {
  let parser
  try {
    parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    const text = result.text || ''
    if (hasMeaningfulResumeText(text)) {
      return { text, usedOcr: false }
    }
    const ocrText = await ocrExtractor(parser)
    if (!hasMeaningfulResumeText(ocrText)) {
      throw Object.assign(new Error('OCR finished, but the scanned PDF does not contain enough readable resume text.'), { code: 'OCR_EMPTY' })
    }
    return { text: ocrText, usedOcr: true }
  } catch (error) {
    throw normalizePdfError(error)
  } finally {
    if (parser) await parser.destroy().catch(() => {})
  }
}

async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value || '', usedOcr: false }
  } catch (cause) {
    throw Object.assign(new Error('The DOCX file is corrupted or could not be read.'), { code: 'CORRUPTED_DOCX', cause })
  }
}

export async function extractResumeData(file, options = {}) {
  let result
  if (file.mimetype === PDF_MIME_TYPE) {
    result = await extractTextFromPdf(file.buffer, options.ocrExtractor)
  } else if (file.mimetype === DOCX_MIME_TYPE) {
    result = await extractTextFromDocx(file.buffer)
  } else {
    const error = new Error('Unsupported file type for text extraction.')
    error.code = 'UNSUPPORTED_FILE_TYPE'
    throw error
  }

  const text = cleanExtractedText(result.text || '')
  if (!hasMeaningfulResumeText(text)) {
    const error = new Error('The extracted document does not contain enough meaningful resume text.')
    error.code = 'EMPTY_EXTRACTION'
    throw error
  }

  const limited = limitText(text)
  console.info(`Resume text extracted successfully (${limited.text.length} chars${result.usedOcr ? ', OCR' : ''}${limited.wasTruncated ? ', truncated' : ''})`)
  return { ...limited, usedOcr: result.usedOcr }
}

export async function extractResumeText(file, options = {}) {
  const result = await extractResumeData(file, options)
  return result.text
}

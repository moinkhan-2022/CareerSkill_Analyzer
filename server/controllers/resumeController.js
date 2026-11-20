import { extractResumeData } from '../services/resumeParserService.js'

export async function extractResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Resume file is required.' })
  }

  try {
    const { text, usedOcr, wasTruncated } = await extractResumeData(req.file)
    return res.json({
      success: true,
      message: 'Resume text extracted successfully.',
      data: {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        textLength: text.length,
        text,
        usedOcr,
        wasTruncated,
      },
    })
  } catch (error) {
    console.error('Resume parsing failed:', error.message)
    const knownErrors = new Set(['EMPTY_EXTRACTION', 'OCR_EMPTY', 'OCR_FAILED', 'PDF_PASSWORD_PROTECTED', 'CORRUPTED_PDF', 'PDF_EXTRACTION_FAILED', 'CORRUPTED_DOCX', 'UNSUPPORTED_FILE_TYPE'])
    if (knownErrors.has(error.code)) {
      const stage = error.code.startsWith('OCR_') ? 'ocr' : 'document_extraction'
      const status = error.code === 'PDF_EXTRACTION_FAILED' || error.code === 'OCR_FAILED' ? 422 : 400
      return res.status(status).json({ success: false, stage, code: error.code, message: error.message })
    }
    return res.status(500).json({ success: false, stage: 'document_extraction', code: 'EXTRACTION_FAILED', message: 'Resume extraction failed because of an unexpected server error.' })
  }
}

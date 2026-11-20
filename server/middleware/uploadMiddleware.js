import multer from 'multer'
import { extname } from 'node:path'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_DOCX_UNCOMPRESSED_SIZE = 20 * 1024 * 1024
const PDF_MIME_TYPE = 'application/pdf'
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const mimeTypeByExtension = new Map([['.pdf', PDF_MIME_TYPE], ['.docx', DOCX_MIME_TYPE]])
const genericMimeTypes = new Set(['', 'application/octet-stream', 'application/zip'])

const storage = multer.memoryStorage()

function uploadError(code, message) {
  return Object.assign(new Error(message), { code })
}

function inspectDocxArchive(buffer) {
  let offset = 0
  let entries = 0
  let uncompressedBytes = 0

  while (offset + 46 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset)
    if (signature !== 0x02014b50) {
      offset += 1
      continue
    }
    entries += 1
    uncompressedBytes += buffer.readUInt32LE(offset + 24)
    const fileNameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    offset += 46 + fileNameLength + extraLength + commentLength
    if (entries > 500 || uncompressedBytes > MAX_DOCX_UNCOMPRESSED_SIZE) return false
  }

  return entries > 0
}

export function detectResumeType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return null

  const headerSample = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1')
  const tailSample = buffer.subarray(Math.max(0, buffer.length - 2048)).toString('latin1')
  if (headerSample.includes('%PDF-') && tailSample.includes('%%EOF')) {
    const pdfText = buffer.toString('latin1')
    if (/\/(?:JavaScript|JS|Launch|EmbeddedFile)\b/i.test(pdfText)) return 'suspicious'
    return { extension: '.pdf', mimeType: PDF_MIME_TYPE }
  }

  if (buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50) {
    const archiveText = buffer.toString('latin1')
    if (/vbaProject\.bin|<script\b/i.test(archiveText)) return 'suspicious'
    if (archiveText.includes('[Content_Types].xml') && archiveText.includes('word/document.xml') && inspectDocxArchive(buffer)) {
      return { extension: '.docx', mimeType: DOCX_MIME_TYPE }
    }
  }

  return null
}

export const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_request, file, callback) => {
    const extension = extname(file.originalname).toLowerCase()
    const expectedMimeType = mimeTypeByExtension.get(extension)
    if (!expectedMimeType || file.originalname.length > 255 || /[\0\r\n]/.test(file.originalname)) {
      return callback(uploadError('INVALID_RESUME_TYPE', 'Only PDF and DOCX resume files are supported.'))
    }
    if (!genericMimeTypes.has(file.mimetype) && file.mimetype !== expectedMimeType) {
      return callback(uploadError('FILE_TYPE_MISMATCH', 'The file extension and reported file type do not match.'))
    }
    return callback(null, true)
  },
}).single('resume')

export function validateResumeUpload(req, _res, next) {
  const file = req.file
  if (!file) return next()
  if (!file.buffer?.length) return next(uploadError('EMPTY_FILE', 'The uploaded resume is empty.'))

  const detected = detectResumeType(file.buffer)
  if (detected === 'suspicious') {
    return next(uploadError('SUSPICIOUS_FILE', 'The uploaded file contains active or embedded content and was rejected.'))
  }
  if (!detected) {
    return next(uploadError('CORRUPTED_OR_UNSUPPORTED_FILE', 'The uploaded file is corrupted or its contents are not a valid PDF or DOCX.'))
  }

  const extension = extname(file.originalname).toLowerCase()
  if (extension !== detected.extension) {
    return next(uploadError('FILE_TYPE_MISMATCH', 'The file extension does not match the file contents.'))
  }

  file.mimetype = detected.mimeType
  return next()
}

export { MAX_FILE_SIZE }

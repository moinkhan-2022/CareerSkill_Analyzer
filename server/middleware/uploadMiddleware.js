import multer from 'multer'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const allowedExtensions = new Set(['.pdf', '.docx'])

const storage = multer.memoryStorage()

export const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_request, file, callback) => {
    const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      const error = new Error('Only PDF and DOCX resume files are supported.')
      error.code = 'INVALID_RESUME_TYPE'
      return callback(error)
    }
    return callback(null, true)
  },
}).single('resume')

export { MAX_FILE_SIZE }

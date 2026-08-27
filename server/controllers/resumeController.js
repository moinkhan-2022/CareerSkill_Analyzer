import { extractResumeText } from '../services/resumeParserService.js'

export async function extractResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Resume file is required.' })
  }

  try {
    const text = await extractResumeText(req.file)
    return res.json({
      success: true,
      message: 'Resume text extracted successfully.',
      data: {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        textLength: text.length,
        text,
      },
    })
  } catch (error) {
    console.error('Resume parsing failed:', error.message)
    if (error.code === 'EMPTY_EXTRACTION') {
      return res.status(400).json({ success: false, message: 'We could not extract readable text from this resume. Please upload a text-based PDF or DOCX file.' })
    }
    return res.status(500).json({ success: false, message: 'Unable to process the resume. Please upload another file.' })
  }
}

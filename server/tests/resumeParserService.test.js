import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PDFParse } from 'pdf-parse'
import { extractPdfWithOcr, extractResumeData } from '../services/resumeParserService.js'

const pdfMimeType = 'application/pdf'
const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url)
const mammothFixture = (name) => new URL(`../node_modules/mammoth/test/test-data/${name}`, import.meta.url)

test('extracts meaningful text from a text-based PDF without OCR', async () => {
  const buffer = await readFile(fixture('text-resume.pdf'))
  const result = await extractResumeData({ mimetype: pdfMimeType, buffer })
  assert.match(result.text, /real resume/i)
  assert.equal(result.usedOcr, false)
  assert.equal(result.wasTruncated, false)
})

test('uses OCR fallback when the PDF text layer is insufficient', async () => {
  const buffer = await readFile(fixture('short-resume.pdf'))
  const ocrText = 'Experienced MERN stack developer skilled in JavaScript React Node MongoDB Express APIs testing deployment and teamwork.'
  const result = await extractResumeData({ mimetype: pdfMimeType, buffer }, { ocrExtractor: async () => ocrText })
  assert.equal(result.text, ocrText)
  assert.equal(result.usedOcr, true)
})

test('OCR engine reads a rendered PDF page', async () => {
  const buffer = await readFile(fixture('text-resume.pdf'))
  const parser = new PDFParse({ data: buffer })
  try {
    const text = await extractPdfWithOcr(parser)
    assert.match(text, /real resume/i)
  } finally {
    await parser.destroy()
  }
})

test('rejects a scanned PDF when OCR cannot find meaningful text', async () => {
  const buffer = await readFile(fixture('short-resume.pdf'))
  await assert.rejects(
    extractResumeData({ mimetype: pdfMimeType, buffer }, { ocrExtractor: async () => '' }),
    { code: 'OCR_EMPTY' },
  )
})

test('extracts meaningful text from a DOCX', async () => {
  const buffer = await readFile(mammothFixture('tables.docx'))
  const result = await extractResumeData({ mimetype: docxMimeType, buffer })
  assert.match(result.text, /Top left/)
  assert.equal(result.usedOcr, false)
})

test('rejects empty DOCX content', async () => {
  const buffer = await readFile(mammothFixture('empty.docx'))
  await assert.rejects(extractResumeData({ mimetype: docxMimeType, buffer }), { code: 'EMPTY_EXTRACTION' })
})

test('rejects corrupted DOCX content', async () => {
  await assert.rejects(extractResumeData({ mimetype: docxMimeType, buffer: Buffer.from('not a zip file') }), { code: 'CORRUPTED_DOCX' })
})

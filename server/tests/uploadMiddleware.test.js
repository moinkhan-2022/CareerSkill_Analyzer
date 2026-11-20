import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { detectResumeType, validateResumeUpload } from '../middleware/uploadMiddleware.js'

const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url)
const mammothFixture = (name) => new URL(`../node_modules/mammoth/test/test-data/${name}`, import.meta.url)

function validateFile(file) {
  return new Promise((resolve) => validateResumeUpload({ file }, {}, (error) => resolve({ error, file })))
}

test('detects valid PDF contents', async () => {
  const buffer = await readFile(fixture('text-resume.pdf'))
  assert.deepEqual(detectResumeType(buffer), { extension: '.pdf', mimeType: 'application/pdf' })
})

test('detects valid DOCX contents', async () => {
  const buffer = await readFile(mammothFixture('tables.docx'))
  assert.deepEqual(detectResumeType(buffer), {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
})

test('rejects empty and corrupted uploads', async () => {
  assert.equal((await validateFile({ originalname: 'resume.pdf', buffer: Buffer.alloc(0) })).error.code, 'EMPTY_FILE')
  assert.equal((await validateFile({ originalname: 'resume.pdf', buffer: Buffer.from('not a pdf') })).error.code, 'CORRUPTED_OR_UNSUPPORTED_FILE')
})

test('rejects extension and content mismatches', async () => {
  const buffer = await readFile(fixture('text-resume.pdf'))
  assert.equal((await validateFile({ originalname: 'resume.docx', buffer })).error.code, 'FILE_TYPE_MISMATCH')
})

test('rejects PDF active content', () => {
  const suspicious = Buffer.from('%PDF-1.4\n/JavaScript test\n%%EOF')
  assert.equal(detectResumeType(suspicious), 'suspicious')
})

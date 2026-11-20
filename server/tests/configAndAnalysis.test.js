import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeDatabaseError } from '../config/db.js'
import { createGuestIdentity } from '../middleware/authMiddleware.js'
import { analysisSchema } from '../validation/analysisSchema.js'

test('normalizes safe MongoDB connection errors without credentials', () => {
  assert.equal(normalizeDatabaseError({ name: 'MongoParseError', message: 'bad uri' }).code, 'DB_INVALID_URI')
  assert.equal(normalizeDatabaseError({ code: 18, message: 'Authentication failed' }).code, 'DB_AUTH_FAILED')
  assert.equal(normalizeDatabaseError({ name: 'MongoServerSelectionError', message: 'timed out' }).code, 'DB_UNAVAILABLE')
  assert.doesNotMatch(normalizeDatabaseError({ code: 18, message: 'mongodb://user:secret@host' }).message, /secret/)
})

test('creates a stable namespaced guest identity', () => {
  const id = '123e4567-e89b-12d3-a456-426614174000'
  assert.equal(createGuestIdentity(id).uid, `guest:${id}`)
  assert.equal(createGuestIdentity(id).isGuest, true)
})

test('accepts a complete analysis and rejects oversized resume text', () => {
  const payload = {
    resume: {
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      textLength: 80,
      text: 'Experienced JavaScript developer with React Node Express MongoDB testing APIs deployment and communication skills.',
      usedOcr: false,
      wasTruncated: false,
    },
    jobDescription: 'We need a JavaScript developer with React Node APIs testing communication and MongoDB experience.',
    targetRole: 'MERN Developer',
    availableDays: 7,
    hoursPerDay: 2,
    resumeInformation: {},
    jobDescriptionInformation: {},
  }
  assert.equal(analysisSchema.safeParse(payload).success, true)
  const oversized = { ...payload, resume: { ...payload.resume, textLength: 50001, text: 'x'.repeat(50001) } }
  assert.equal(analysisSchema.safeParse(oversized).success, false)
})

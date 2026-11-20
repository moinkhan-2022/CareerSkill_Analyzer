import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'
import { isRetryableAiFailure, normalizeAiError, parseModelJson } from '../services/aiExtractionService.js'

test('normalizes Gemini rate limit, server, auth, model and network errors', () => {
  assert.equal(normalizeAiError({ status: 429, message: 'Too many requests' }).code, 'AI_RATE_LIMITED')
  assert.equal(normalizeAiError({ status: 500, message: 'Internal error' }).code, 'AI_SERVICE_UNAVAILABLE')
  assert.equal(normalizeAiError({ status: 503, message: 'Unavailable' }).code, 'AI_SERVICE_UNAVAILABLE')
  assert.equal(normalizeAiError({ status: 401, message: 'API key invalid' }).code, 'AI_AUTH_FAILED')
  assert.equal(normalizeAiError({ status: 404, message: 'Model not found' }).code, 'AI_MODEL_NOT_FOUND')
  assert.equal(normalizeAiError({ message: 'fetch failed' }).code, 'AI_NETWORK_ERROR')
})

test('retries only transient Gemini failures', () => {
  assert.equal(isRetryableAiFailure({ status: 429 }), true)
  assert.equal(isRetryableAiFailure({ status: 503 }), true)
  assert.equal(isRetryableAiFailure({ status: 401, message: 'invalid key' }), false)
  assert.equal(isRetryableAiFailure({ status: 404, message: 'model not found' }), false)
})

test('validates structured JSON output', () => {
  const schema = z.object({ ok: z.boolean() })
  assert.deepEqual(parseModelJson('{"ok":true}', schema), { ok: true })
  assert.throws(() => parseModelJson('not json', schema), { code: 'INVALID_AI_OUTPUT' })
  assert.throws(() => parseModelJson('{"ok":"yes"}', schema), { code: 'INVALID_AI_OUTPUT' })
})

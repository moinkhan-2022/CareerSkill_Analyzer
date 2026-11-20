import mongoose from 'mongoose'

const DEFAULT_TIMEOUT_MS = 10000

function getTimeoutMs() {
  const configured = Number(process.env.MONGODB_TIMEOUT_MS)
  return Number.isInteger(configured) && configured >= 1000 && configured <= 60000
    ? configured
    : DEFAULT_TIMEOUT_MS
}

export function normalizeDatabaseError(error) {
  const name = error?.name || ''
  const code = Number(error?.code || 0)
  const message = `${error?.message || ''}`.toLowerCase()

  if (name === 'MongoParseError' || name === 'MongoInvalidArgumentError' || /invalid (connection string|scheme|uri)/i.test(message)) {
    return Object.assign(new Error('MongoDB connection string is invalid. Check MONGODB_URI.'), { code: 'DB_INVALID_URI' })
  }
  if (code === 18 || /authentication failed|bad auth|auth failed|scram/i.test(message)) {
    return Object.assign(new Error('MongoDB authentication failed. Check the Atlas database username and password.'), { code: 'DB_AUTH_FAILED' })
  }
  if (/ip (address|access)|whitelist|network access|atlas cluster/i.test(message)) {
    return Object.assign(new Error('MongoDB Atlas rejected the network connection. Check Atlas Network Access.'), { code: 'DB_NETWORK_RESTRICTED' })
  }
  if (name === 'MongoServerSelectionError' || /econnrefused|enotfound|querysrv|timed out|server selection/i.test(message)) {
    return Object.assign(new Error('MongoDB server is unavailable. Check the cluster status and network connection.'), { code: 'DB_UNAVAILABLE' })
  }
  return Object.assign(new Error('MongoDB connection failed.'), { code: 'DB_CONNECTION_FAILED' })
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw Object.assign(new Error('MONGODB_URI is not configured.'), { code: 'DB_MISSING_URI' })
  }
  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    throw Object.assign(new Error('MongoDB connection string is invalid. Check MONGODB_URI.'), { code: 'DB_INVALID_URI' })
  }

  const timeoutMs = getTimeoutMs()
  let timeoutId
  try {
    const connectionAttempt = mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
      socketTimeoutMS: 45000,
    })
    const overallTimeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(Object.assign(new Error(`MongoDB connection timed out after ${timeoutMs} ms.`), { code: 'DB_CONNECT_TIMEOUT' })), timeoutMs)
    })
    await Promise.race([connectionAttempt, overallTimeout])
    console.log('MongoDB connected successfully')
  } catch (error) {
    void mongoose.connection.destroy().catch(() => {})
    const normalized = normalizeDatabaseError(error)
    console.error(normalized.message)
    throw normalized
  } finally {
    clearTimeout(timeoutId)
  }
}

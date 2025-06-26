import crypto from 'crypto'

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  )
}

// Data encryption/decryption for sensitive fields
const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required')
}

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

export function decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
  const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'))
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .trim()
    .slice(0, 1000) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://api.github.com",
    "frame-src https://js.stripe.com",
  ].join('; '),
}

// IP address validation and blocking
const BLOCKED_IPS = new Set<string>()
const IP_ATTEMPT_TRACKER = new Map<string, { count: number; lastAttempt: number }>()

export function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip)
}

export function trackFailedAttempt(ip: string): boolean {
  const now = Date.now()
  const attempts = IP_ATTEMPT_TRACKER.get(ip) || { count: 0, lastAttempt: 0 }
  
  // Reset counter if last attempt was over an hour ago
  if (now - attempts.lastAttempt > 3600000) {
    attempts.count = 0
  }
  
  attempts.count++
  attempts.lastAttempt = now
  IP_ATTEMPT_TRACKER.set(ip, attempts)
  
  // Block IP if more than 10 failed attempts in an hour
  if (attempts.count > 10) {
    BLOCKED_IPS.add(ip)
    return true
  }
  
  return false
}

export function clearFailedAttempts(ip: string): void {
  IP_ATTEMPT_TRACKER.delete(ip)
  BLOCKED_IPS.delete(ip)
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Validate file uploads
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large' }
  }
  
  return { isValid: true }
}
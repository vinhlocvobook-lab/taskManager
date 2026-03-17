import { z } from 'zod'

// Email validation helper
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email()
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

// Validate email format
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailTrimmed = email.trim()
  
  if (emailTrimmed.length === 0) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (emailTrimmed.length > 254) {
    return { valid: false, error: 'Email is too long' }
  }
  
  // Basic email regex validation (more strict than Zod for edge cases)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(emailTrimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true }
}
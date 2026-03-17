import { describe, it, expect } from 'vitest'
import { isValidEmail, validateEmail } from '../utils/validation'

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('TC-EMAIL-001: Valid email should return true', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('TC-EMAIL-002: Invalid email should return false', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('@nodomain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('validateEmail with detailed errors', () => {
    it('TC-EMAIL-003: Valid email returns valid:true', () => {
      const result = validateEmail('test@example.com')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('TC-EMAIL-004: Missing email returns error', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('TC-EMAIL-005: Invalid format returns error', () => {
      const result = validateEmail('not-an-email')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('TC-EMAIL-006: Email without @ returns error', () => {
      const result = validateEmail('plainaddress')
      expect(result.valid).toBe(false)
    })

    it('TC-EMAIL-007: Email without domain returns error', () => {
      const result = validateEmail('user@')
      expect(result.valid).toBe(false)
    })

    it('TC-EMAIL-008: Email with spaces returns error', () => {
      const result = validateEmail('user @domain.com')
      expect(result.valid).toBe(false)
    })
  })
})
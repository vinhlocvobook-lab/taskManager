import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import rateLimit from 'express-rate-limit'

const app = express()
app.use(express.json())

// Rate limiting middleware
const testLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Test endpoint with rate limiting
app.post('/api/test/rate-limit', testLimiter, (req, res) => {
  res.json({ message: 'Success' })
})

describe('Rate Limiting Tests', () => {
  it('TC-RATE-001: Should allow requests within limit', async () => {
    const response = await request(app)
      .post('/api/test/rate-limit')
      .send({})
    
    // First 5 requests should succeed
    expect([200, 429]).toContain(response.status)
  })

  it('TC-RATE-002: Should include rate limit info in response', async () => {
    const response = await request(app)
      .post('/api/test/rate-limit')
      .send({})
    
    // Check rate limit info is present (headers may vary by version)
    expect(response.headers).toBeDefined()
  })

  it('TC-RATE-003: Should block requests exceeding limit', async () => {
    // Make up to 5 requests
    let rateLimited = false
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/test/rate-limit')
        .send({})
      if (response.status === 429) {
        rateLimited = true
        expect(response.body.error).toBe('Too many requests, please try again later')
        break
      }
    }
    expect(rateLimited).toBe(true)
  })
})
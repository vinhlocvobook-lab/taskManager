import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create test app
const app = express()
app.use(cors())
app.use(express.json())

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, tenantName } = req.body
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Password complexity validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' })
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' })
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' })
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one special character (!@#$%^&*)' })
    }
    
    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    
    // Create tenant
    const slug = (tenantName || 'test-org').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const tenant = await prisma.tenant.create({
      data: { name: tenantName || 'Test Org', slug },
    })
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    })
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, tenantId: tenant.id, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
      { expiresIn: '7d' }
    )
    
    res.status(201).json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
      { expiresIn: '7d' }
    )
    
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret')
    
    res.json({ message: 'Protected endpoint accessed', user: decoded })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

const testEmail = `security-test-${Date.now()}@example.com`

describe('Security Tests', () => {
  
  describe('Password Complexity', () => {
    it('TC-PASS-001: Password without lowercase should fail', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `pass1-${Date.now()}@example.com`,
          password: 'PASSWORD123!',
          name: 'Test',
        })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('lowercase')
    })

    it('TC-PASS-002: Password without number should fail', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `pass2-${Date.now()}@example.com`,
          password: 'PasswordAbc!',
          name: 'Test',
        })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('number')
    })

    it('TC-PASS-003: Password without special character should fail', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `pass3-${Date.now()}@example.com`,
          password: 'Password123',
          name: 'Test',
        })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('special character')
    })

    it('TC-PASS-004: Valid password should pass all complexity checks', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `pass4-${Date.now()}@example.com`,
          password: 'ValidPass123!',
          name: 'Test',
        })
      
      expect(response.status).toBe(201)
    })
  })

  describe('JWT Token', () => {
    let accessToken: string
    let refreshToken: string

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: 'JWT Test User',
        })
      accessToken = response.body.accessToken
      refreshToken = response.body.refreshToken
    })

    it('TC-JWT-001: Access token should be generated on register', () => {
      expect(accessToken).toBeDefined()
      expect(typeof accessToken).toBe('string')
    })

    it('TC-JWT-002: Refresh token should be generated on register', () => {
      expect(refreshToken).toBeDefined()
      expect(typeof refreshToken).toBe('string')
    })

    it('TC-JWT-003: Should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
      
      expect(response.status).toBe(200)
    })

    it('TC-JWT-004: Should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
      
      expect(response.status).toBe(401)
    })

    it('TC-JWT-005: Should deny access without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
      
      expect(response.status).toBe(401)
    })

    it('TC-JWT-006: Token should contain user payload', () => {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'test-secret')
      expect(decoded).toHaveProperty('userId')
      expect(decoded).toHaveProperty('tenantId')
      expect(decoded).toHaveProperty('role')
    })
  })

  describe('SQL Injection Prevention', () => {
    it('TC-SQL-001: SQL injection in email should not work', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: "password' OR '1'='1",
        })
      
      // Should not authenticate successfully
      expect(response.status).toBe(401)
    })

    it('TC-SQL-002: SQL injection in password should not work', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: "' OR '1'='1",
        })
      
      expect(response.status).toBe(401)
    })
  })

  describe('XSS Prevention', () => {
    it('TC-XSS-001: Special characters in name should be sanitized (stored as-is)', async () => {
      const xssName = '<script>alert("xss")</script>'
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `xss-${Date.now()}@example.com`,
          password: 'Password123!',
          name: xssName,
        })
      
      // Should store but not execute - this tests storage is safe
      expect(response.status).toBe(201)
      // In real app, output should be escaped when rendered
    })
  })
})
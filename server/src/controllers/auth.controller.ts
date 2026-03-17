import { Response, NextFunction } from 'express'
import { login, register, refreshTokens, getCurrentUser } from '../services/auth.service.js'
import { loginSchema, registerSchema } from '../services/auth.service.js'
import { AuthRequest } from '../middlewares/auth.js'

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const result = await login(input)
    res.json(result)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      })
    }
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message })
    }
    next(error)
  }
}

export async function registerHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const result = await register(input)
    res.status(201).json(result)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      })
    }
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message })
    }
    next(error)
  }
}

export async function refreshHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }
    
    const tokens = await refreshTokens(refreshToken)
    res.json(tokens)
  } catch (error: any) {
    if (error.message === 'Invalid refresh token') {
      return res.status(401).json({ error: error.message })
    }
    next(error)
  }
}

export async function meHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser(req.user!.id)
    res.json(user)
  } catch (error) {
    next(error)
  }
}
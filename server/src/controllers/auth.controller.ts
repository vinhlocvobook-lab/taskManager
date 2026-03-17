import { Response, NextFunction } from 'express'
import { login, register, refreshTokens, getCurrentUser, refreshTokenCookieOptions } from '../services/auth.service.js'
import { loginSchema, registerSchema } from '../services/auth.service.js'
import { AuthRequest } from '../middlewares/auth.js'
import { validateEmail } from '../utils/validation.js'

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const result = await login(input)
    
    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions)
    
    res.json({ user: result.user, accessToken: result.accessToken })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message })
    }
    next(error)
  }
}

export async function registerHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email } = req.body
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error })
    }
    
    const input = registerSchema.parse(req.body)
    const result = await register(input)
    
    res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions)
    res.status(201).json({ user: result.user, accessToken: result.accessToken })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message })
    }
    next(error)
  }
}

export async function refreshHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }
    
    const tokens = await refreshTokens(refreshToken)
    res.cookie('refreshToken', tokens.refreshToken, refreshTokenCookieOptions)
    res.json({ accessToken: tokens.accessToken })
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

export async function logoutHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    res.json({ message: 'Logged out successfully' })
  }
}

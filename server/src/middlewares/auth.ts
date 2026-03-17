import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    tenantId: string
    role: string
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      tenantId: string
      role: string
    }

    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function optionalAuth(req: AuthReq, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      tenantId: string
      role: string
    }

    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    }
  } catch {
    // Ignore invalid token for optional auth
  }

  next()
}

// Type for request with optional user
interface AuthReq extends Request {
  user?: {
    id: string
    tenantId: string
    role: string
  }
}
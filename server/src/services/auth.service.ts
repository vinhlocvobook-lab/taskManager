import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .refine((p) => /[A-Z]/.test(p), 'Password must contain at least one uppercase letter')
    .refine((p) => /[a-z]/.test(p), 'Password must contain at least one lowercase letter')
    .refine((p) => /[0-9]/.test(p), 'Password must contain at least one number')
    .refine((p) => /[!@#$%^&*]/.test(p), 'Password must contain at least one special character (!@#$%^&*)'),
  name: z.string().min(1).max(100),
  tenantName: z.string().min(1).max(100).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

// JWT helpers
function generateTokens(userId: string, tenantId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, tenantId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function login(input: LoginInput) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { tenant: true },
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Verify password
  const validPassword = await bcrypt.compare(input.password, user.password)
  if (!validPassword) {
    throw new Error('Invalid email or password')
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.tenantId, user.role)

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return {
    user: userWithoutPassword,
    ...tokens,
  }
}

export async function register(input: RegisterInput) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existingUser) {
    throw new Error('Email already registered')
  }

  // Create tenant if not exists, or use default
  let tenantId: string
  
  if (input.tenantName) {
    const slug = input.tenantName.toLowerCase().replace(/\s+/g, '-')
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
    
    if (existingTenant) {
      tenantId = existingTenant.id
    } else {
      const tenant = await prisma.tenant.create({
        data: {
          name: input.tenantName,
          slug,
        },
      })
      tenantId = tenant.id
    }
  } else {
    // Create default tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'My Organization',
        slug: `org-${Date.now()}`,
      },
    })
    tenantId = tenant.id
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 12)

  // Create user as OWNER
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      tenantId,
      role: 'OWNER',
    },
    include: { tenant: true },
  })

  // Generate tokens
  const tokens = generateTokens(user.id, user.tenantId, user.role)

  const { password: _, ...userWithoutPassword } = user
  return {
    user: userWithoutPassword,
    ...tokens,
  }
}

export async function refreshTokens(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string
      type: string
    }

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return generateTokens(user.id, user.tenantId, user.role)
  } catch {
    throw new Error('Invalid refresh token')
  }
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
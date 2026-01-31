import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-in-production')

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

// ===================================================
// JWT TOKENS
// ===================================================

export async function createToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ===================================================
// SESSION MANAGEMENT
// ===================================================

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// ===================================================
// MOCK USER STORAGE (Demo purposes - replace with real DB)
// ===================================================

// In-memory mock users for demo
const mockUsers: Map<string, { id: string; name: string; email: string; password: string; role: string }> = new Map()

// Simple hash function for demo (not secure - use bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

// ===================================================
// USER AUTHENTICATION
// ===================================================

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    // Check if user exists
    if (mockUsers.has(email)) {
      return { success: false, error: 'Email already registered' }
    }

    // Create user
    const userId = `user_${Date.now()}`
    const hashedPassword = simpleHash(password)
    
    mockUsers.set(email, {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    })

    // Create and return token
    const token = await createToken({
      userId,
      email,
      role: 'USER',
    })

    await setSession(token)

    return { success: true, token }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    // Demo admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = await createToken({
        userId: 'admin_1',
        email,
        role: 'ADMIN',
      })
      await setSession(token)
      return { success: true, token }
    }

    // Find user in mock storage
    const user = mockUsers.get(email)
    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Verify password
    if (simpleHash(password) !== user.password) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Create and return token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await setSession(token)

    return { success: true, token }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Failed to sign in' }
  }
}

export async function signOut(): Promise<void> {
  await clearSession()
}

// ===================================================
// AUTHORIZATION
// ===================================================

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  if (session.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  return session
}

// ===================================================
// USER DATA
// ===================================================

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  // Return mock user data
  return {
    id: session.userId,
    name: session.email.split('@')[0],
    email: session.email,
    image: null,
    role: session.role,
    createdAt: new Date(),
  }
}

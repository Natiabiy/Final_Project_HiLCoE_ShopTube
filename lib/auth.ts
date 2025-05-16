import { jwtVerify, SignJWT } from "jose"
import bcrypt from "bcryptjs"

// JWT secret key (in production, use a more secure method to store this)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "shoptube-jwt-secret")

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate a JWT token
export async function generateToken(payload: any): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// Create Hasura JWT claims
export function createHasuraClaims(user: any) {
  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [user.role],
      "x-hasura-default-role": user.role,
      "x-hasura-user-id": user.id,
    },
  }
}

const JWT_SECRET2 = process.env.JWT_SECRET || ""

export async function verifyJwt(token: string) {
  if (!token) return null

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET is not defined")
      return null
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

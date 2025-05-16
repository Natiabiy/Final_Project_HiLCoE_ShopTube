import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";

// ✅ JWT secret key (make sure this matches Hasura config exactly)
const RAW_SECRET = process.env.JWT_SECRET || "d8ad59547a38696304279bf3bdddc60f230235e36585e55b5197a89ee3255c271f0451643653db15bd08cc1795bd25e27faea7ac39df06e4ae3351342e70bc4e";
const JWT_SECRET = new TextEncoder().encode(RAW_SECRET);

// ✅ Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// ✅ Verify a password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// ✅ Create Hasura-compatible JWT claims
export function createHasuraClaims(user: any) {
  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [user.role],
      "x-hasura-default-role": user.role,
      "x-hasura-user-id": user.id.toString(), // Ensure it's a string
    },
  };
}

// ✅ Generate JWT token
export async function generateToken(user: any): Promise<string> {
  const payload = {
    ...createHasuraClaims(user),
    id: user.id,
    role: user.role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

// ✅ Verify token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// ✅ Alternate verify method
export async function verifyJwt(token: string) {
  if (!token) return null;

  try {
    // ❌ BUG FIXED: You were using a string literal "JWT_SECRET" instead of the actual secret value
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

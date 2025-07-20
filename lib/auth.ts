import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";

// JWT secret key (make sure this matches Hasura config exactly)
const RAW_SECRET =
  process.env.JWT_SECRET ||
  "d8ad59547a38696304279bf3bdddc60f230235e36585e55b5197a89ee3255c271f0451643653db15bd08cc1795bd25e27faea7ac39df06e4ae3351342e70bc4e";
const JWT_SECRET = new TextEncoder().encode(RAW_SECRET);

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify a password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Create Hasura-compatible JWT claims
export function createHasuraClaims(user: any) {
  if (!user?.id || !user?.role) {
    console.error("createHasuraClaims() error - passed object:", user);
    throw new Error("Missing user ID or role for Hasura claims.");
  }

  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [user.role],
      "x-hasura-default-role": user.role,
      "x-hasura-user-id": String(user.id),
    },
  };
}

// Generate JWT token
export async function generateToken(user: any): Promise<string> {
  const payload = {
    ...createHasuraClaims(user),
    sub: user.id, // Added for compatibility
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

// Verify token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("Token expired");
      return null;
    }
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Alternate verify method
export async function verifyJwt(token: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("Token expired");
      return null;
    }
    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// LOCAL TESTING BLOCK
if (require.main === module) {
  (async () => {
    console.log("🔧 Running local tests...");

    const testPassword = "mysecret123";
    const user = { id: 1, role: "user", name: "Test User", email: "test@example.com" };

    // Hash
    const hashed = await hashPassword(testPassword);
    console.log("🔐 Hashed Password:", hashed);

    // Verify
    const isMatch = await verifyPassword(testPassword, hashed);
    console.log("✅ Password Match:", isMatch);

    // Generate JWT
    const token = await generateToken(user);
    console.log("🪙 Generated JWT:", token);

    // Verify JWT
    const decoded = await verifyToken(token);
    console.log("📜 Decoded JWT Payload:", decoded);
  })();
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  console.log("🔐 Cookie token in /api/session:", token);

  if (!token) {
    return NextResponse.json({ user: null, token: null }, { status: 200 });
  }

  const payload = await verifyToken(token);

  if (!payload || !payload.sub || !payload.role) {
    return NextResponse.json({ user: null, token: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
    token,
  });
}
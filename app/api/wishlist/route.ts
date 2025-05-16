import { type NextRequest, NextResponse } from "next/server"
import { getUserWishlist, addToWishlist } from "@/app/customer/wishlist/actions"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  // Get token from Authorization header instead of cookie
  const authHeader = request.headers.get("Authorization")
  const token = authHeader ? authHeader.replace("Bearer ", "") : null

  if (!token) {
    // Return empty wishlist for unauthenticated users instead of error
    return NextResponse.json({
      success: true,
      wishlistItems: [],
      message: "User not authenticated, returning empty wishlist",
    })
  }

  // Use verifyToken from auth.ts
  const payload = await verifyToken(token)

  if (!payload || payload.sub !== userId) {
    // Return empty wishlist for unauthorized users instead of error
    return NextResponse.json({
      success: true,
      wishlistItems: [],
      message: "User not authorized, returning empty wishlist",
    })
  }

  const result = await getUserWishlist(userId)

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, productId } = body

  if (!userId || !productId) {
    return NextResponse.json({ success: false, error: "User ID and Product ID are required" }, { status: 400 })
  }

  // Get token from Authorization header instead of cookie
  const authHeader = request.headers.get("Authorization")
  const token = authHeader ? authHeader.replace("Bearer ", "") : null

  if (!token) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  // Use verifyToken from auth.ts
  const payload = await verifyToken(token)

  if (!payload || payload.sub !== userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const result = await addToWishlist(userId, productId)

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

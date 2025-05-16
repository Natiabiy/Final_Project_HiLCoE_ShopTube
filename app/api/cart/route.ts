import { type NextRequest, NextResponse } from "next/server"
import { getUserCart } from "@/app/customer/cart/actions"
import { verifyJwt } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  // Verify authentication
  const token = request.cookies.get("auth_token")?.value
  if (!token) {
    // Return empty cart for unauthenticated users instead of error
    return NextResponse.json({
      success: true,
      cartItems: [],
      message: "User not authenticated, returning empty cart",
    })
  }

  const payload = await verifyJwt(token)
  if (!payload || payload.userId !== userId) {
    // Return empty cart for unauthorized users instead of error
    return NextResponse.json({
      success: true,
      cartItems: [],
      message: "User not authorized, returning empty cart",
    })
  }

  const result = await getUserCart(userId)

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

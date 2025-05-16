import { type NextRequest, NextResponse } from "next/server"
import { removeFromWishlist } from "@/app/customer/wishlist/actions"
import { verifyToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const wishlistItemId = params.id

  // Get user ID from query parameter
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  // Get token from Authorization header
  const authHeader = request.headers.get("Authorization")
  const token = authHeader ? authHeader.replace("Bearer ", "") : null

  if (!token) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  const payload = await verifyToken(token)

  if (!payload || payload.sub !== userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const result = await removeFromWishlist(wishlistItemId)

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

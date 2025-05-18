import { type NextRequest, NextResponse } from "next/server"
import { removeFromWishlist } from "@/app/customer/wishlist/actions"
import { verifyToken } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  Context: { params: { id: string } }
) {
  const params = await Context.params
  const wishlistItemId = params.id

  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.replace("Bearer ", "") ?? null

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }

  const payload = await verifyToken(token)

  const userId =
    payload?.["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]

  if (!userId) {
    console.log("Decoded JWT payload:", payload)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const result = await removeFromWishlist(wishlistItemId, userId)

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

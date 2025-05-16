import { type NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/graphql-client"
import { verifyJwt } from "@/lib/auth"
import { GET_ORDER_BY_ID } from "@/lib/graphql-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!orderId || !userId) {
    return NextResponse.json({ success: false, error: "Order ID and User ID are required" }, { status: 400 })
  }

  // Verify authentication
  const token = request.cookies.get("auth_token")?.value
  if (!token) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  const payload = await verifyJwt(token)
  if (!payload || payload.userId !== userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { orders } = await adminClient.request(GET_ORDER_BY_ID, {
      orderId,
      userId,
    })

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: orders[0],
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order details" }, { status: 500 })
  }
}

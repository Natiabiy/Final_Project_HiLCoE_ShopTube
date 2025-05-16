import { type NextRequest, NextResponse } from "next/server"
import { adminClient, gql } from "@/lib/graphql-client"

const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [uuid!]) {
    products(where: {id: {_in: $ids}}) {
      id
      name
      description
      price
      stock
      image_url
      seller_id
      created_at
    }
  }
`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const idsParam = searchParams.get("ids")

  if (!idsParam) {
    return NextResponse.json({ success: false, error: "Product IDs are required" }, { status: 400 })
  }

  const ids = idsParam.split(",")

  try {
    const { products } = await adminClient.request(GET_PRODUCTS_BY_IDS, { ids })

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

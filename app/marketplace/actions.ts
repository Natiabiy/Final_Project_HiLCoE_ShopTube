"use server"

import { adminClient, GET_MARKETPLACE_PRODUCTS } from "@/lib/graphql-client"

export async function getMarketplaceProducts(limit = 12, offset = 0, search = "%") {
  try {
    const data = await adminClient.request(GET_MARKETPLACE_PRODUCTS, {
      limit,
      offset,
      search,
    })

    // Get seller details for each product
    const productsWithSellerInfo = await Promise.all(
      data.products.map(async (product: any) => {
        try {
          // Get seller info
          const sellerQuery = `
            query GetSellerInfo($sellerId: uuid!) {
              users_by_pk(id: $sellerId) {
                id
                name
              }
            }
          `
          const sellerData = await adminClient.request(sellerQuery, { sellerId: product.seller_id })

          // Get seller profile info
          const profileQuery = `
            query GetSellerProfile($userId: uuid!) {
              seller_profiles(where: {user_id: {_eq: $userId}}) {
                id
                business_name
                description
                is_approved
              }
            }
          `
          const profileData = await adminClient.request(profileQuery, { userId: product.seller_id })

          const sellerProfile = profileData.seller_profiles[0] || null

          // Only include approved sellers
          if (sellerProfile && sellerProfile.is_approved) {
            return {
              ...product,
              seller: {
                id: sellerData.users_by_pk.id,
                name: sellerData.users_by_pk.name,
                seller_profile: sellerProfile,
              },
            }
          }
          return null
        } catch (error) {
          console.error("Error fetching seller info:", error)
          return null
        }
      }),
    )

    // Filter out null products (from unapproved sellers)
    const filteredProducts = productsWithSellerInfo.filter((product) => product !== null)

    return {
      success: true,
      products: filteredProducts,
      totalCount: filteredProducts.length,
    }
  } catch (error) {
    console.error("Error fetching marketplace products:", error)
    return {
      success: false,
      error: "Failed to fetch products",
      products: [],
      totalCount: 0,
    }
  }
}

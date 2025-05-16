"use server"

import { adminClient, GET_PRODUCT_BY_ID, gql } from "@/lib/graphql-client"

// Add a query to get seller details
const GET_SELLER_DETAILS = gql`
  query GetSellerDetails($sellerId: uuid!) {
    users_by_pk(id: $sellerId) {
      id
      name
      seller_profiles(limit: 1) {
        id
        business_name
        description
      }
    }
  }
`

export async function getProductById(productId: string) {
  try {
    const { products_by_pk } = await adminClient.request(GET_PRODUCT_BY_ID, { productId })

    if (!products_by_pk) {
      return { success: false, error: "Product not found" }
    }

    // Fetch seller details
    if (products_by_pk.seller_id) {
      const { users_by_pk: seller } = await adminClient.request(GET_SELLER_DETAILS, {
        sellerId: products_by_pk.seller_id,
      })

      if (seller) {
        products_by_pk.seller = {
          id: seller.id,
          name: seller.name,
          seller_profile: seller.seller_profiles[0] || null,
        }
      }
    }

    return { success: true, product: products_by_pk }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

// Add a function to check if user is subscribed to a seller
export async function checkUserSubscribed(userId: string, sellerId: string) {
  try {
    const query = gql`
      query CheckSubscription($userId: uuid!, $sellerId: uuid!) {
        subscriptions(where: {
          customer_id: {_eq: $userId},
          seller_id: {_eq: $sellerId}
        }) {
          id
        }
      }
    `

    const result = await adminClient.request(query, { userId, sellerId })

    return {
      success: true,
      isSubscribed: result.subscriptions && result.subscriptions.length > 0,
    }
  } catch (error) {
    console.error("Error checking subscription:", error)
    return { success: false, isSubscribed: false }
  }
}

"use server"

import { adminClient, gql } from "@/lib/graphql-client"

// Updated query to fetch user and seller profile separately
const GET_SELLER_WITH_PRODUCTS = gql`
  query GetSellerWithProducts($sellerId: uuid!) {
    users_by_pk(id: $sellerId) {
      id
      name
    }
    seller_profiles(where: {user_id: {_eq: $sellerId}}) {
      id
      business_name
      description
    }
    products(where: {seller_id: {_eq: $sellerId}}) {
      id
      name
      description
      price
      stock
      image_url
      created_at
    }
  }
`

export async function getSellerWithProducts(sellerId: string) {
  try {
    const result = await adminClient.request(GET_SELLER_WITH_PRODUCTS, { sellerId })

    if (!result.users_by_pk) {
      return { success: false, error: "Seller not found" }
    }

    // Restructure the data to match the expected format
    const seller = {
      id: result.users_by_pk.id,
      name: result.users_by_pk.name,
      seller_profile: result.seller_profiles[0] || {
        id: "",
        business_name: "Unknown Business",
        description: "",
      },
      products: result.products || [],
    }

    return { success: true, seller }
  } catch (error) {
    console.error("Error fetching seller:", error)
    return { success: false, error: "Failed to fetch seller" }
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

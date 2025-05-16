"use server"

import { adminClient, GET_SELLER_ORDERS } from "@/lib/graphql-client"

export async function getSellerOrders(sellerId: string) {
  try {
    const data = await adminClient.request(GET_SELLER_ORDERS, { sellerId })

    return {
      success: true,
      orders: data.orders || [],
    }
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    return {
      success: false,
      error: "Failed to fetch orders",
    }
  }
}

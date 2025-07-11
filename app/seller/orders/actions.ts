"use server"

import { adminClient, GET_SELLER_ORDERS, UPDATE_ORDER_STATUS} from "@/lib/graphql-client"


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

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const data = await adminClient.request(UPDATE_ORDER_STATUS, { orderId, status })

    return {
      success: true,
      updatedOrder: data.update_orders_by_pk,
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    return {
      success: false,
      error: "Failed to update order status",
    }
  }
}
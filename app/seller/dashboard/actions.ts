"use server"

import { adminClient, GET_SELLER_DASHBOARD_STATS } from "@/lib/graphql-client"

export async function getSellerDashboardStats(sellerId: string) {
  try {
    const data = await adminClient.request(GET_SELLER_DASHBOARD_STATS, { sellerId })

    return {
      success: true,
      stats: {
        totalSales: data.orders_aggregate.aggregate.sum?.total_amount || 0,
        productCount: data.products_aggregate.aggregate.count || 0,
        subscriberCount: data.subscriptions_aggregate.aggregate.count || 0,
        recentOrders: data.orders || [],
      },
    }
  } catch (error) {
    console.error("Error fetching seller dashboard stats:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    }
  }
}

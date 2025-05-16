"use server"

import { adminClient, GET_CUSTOMER_DASHBOARD_STATS, GET_USER_BY_ID } from "@/lib/graphql-client"

export async function getCustomerDashboardStats(customerId: string) {
  try {
    const result = await adminClient.request(GET_CUSTOMER_DASHBOARD_STATS, { customerId })

    // For each subscription, fetch the seller details
    const subscriptions = result.subscriptions || []
    const subscriptionsWithSellerDetails = await Promise.all(
      subscriptions.map(async (subscription: any) => {
        try {
          const { users_by_pk } = await adminClient.request(GET_USER_BY_ID, {
            userId: subscription.seller_id,
          })

          return {
            ...subscription,
            seller: users_by_pk,
          }
        } catch (error) {
          console.error("Error fetching seller details:", error)
          return subscription
        }
      }),
    )

    return {
      success: true,
      data: {
        ...result,
        subscriptions: subscriptionsWithSellerDetails,
      },
    }
  } catch (error) {
    console.error("Error fetching customer dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard statistics" }
  }
}

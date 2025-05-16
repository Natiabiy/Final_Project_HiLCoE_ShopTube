"use server"

import { adminClient, GET_SELLER_SUBSCRIBERS, GET_USER_DETAILS } from "@/lib/graphql-client"

export async function getSellerSubscribers(sellerId: string) {
  try {
    const data = await adminClient.request(GET_SELLER_SUBSCRIBERS, { sellerId })

    // Get the list of subscriptions
    const subscriptions = data.subscriptions || []

    // For each subscription, try to fetch the user details
    const subscribersWithUserDetails = await Promise.all(
      subscriptions.map(async (subscription: any) => {
        try {
          // Try to fetch user details for each customer_id
          const userDetails = await adminClient.request(GET_USER_DETAILS, {
            userId: subscription.customer_id,
          })

          // Add user details to the subscription object
          return {
            ...subscription,
            user: userDetails.users_by_pk,
          }
        } catch (error) {
          // If we can't get user details, just return the subscription as is
          console.error(`Error fetching user details for customer ${subscription.customer_id}:`, error)
          return subscription
        }
      }),
    )

    return {
      success: true,
      subscribers: subscribersWithUserDetails,
    }
  } catch (error) {
    console.error("Error fetching seller subscribers:", error)
    return {
      success: false,
      error: "Failed to fetch subscribers",
    }
  }
}

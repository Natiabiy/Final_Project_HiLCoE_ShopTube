"use server"

import {
  adminClient,
  GET_CUSTOMER_SUBSCRIPTIONS,
  SUBSCRIBE_TO_SELLER,
  UNSUBSCRIBE_FROM_SELLER,
  GET_USER_BY_ID,
} from "@/lib/graphql-client"
import { revalidatePath } from "next/cache"

export async function getCustomerSubscriptions(customerId: string) {
  try {
    const { subscriptions } = await adminClient.request(GET_CUSTOMER_SUBSCRIPTIONS, { customerId })

    // For each subscription, fetch the seller details
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

    return { success: true, subscriptions: subscriptionsWithSellerDetails }
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error)
    return { success: false, error: "Failed to fetch subscriptions" }
  }
}

export async function subscribeToSeller(customerId: string, sellerId: string) {
  try {
    const { insert_subscriptions_one } = await adminClient.request(SUBSCRIBE_TO_SELLER, {
      customerId,
      sellerId,
    })

    revalidatePath("/customer/subscriptions")
    revalidatePath("/customer/dashboard")

    return {
      success: true,
      message: "Subscribed successfully",
      subscription: insert_subscriptions_one,
    }
  } catch (error) {
    console.error("Error subscribing to seller:", error)
    return {
      success: false,
      message: "Failed to subscribe. Please try again.",
    }
  }
}

export async function unsubscribeFromSeller(customerId: string, sellerId: string) {
  try {
    const { delete_subscriptions } = await adminClient.request(UNSUBSCRIBE_FROM_SELLER, {
      customerId,
      sellerId,
    })

    revalidatePath("/customer/subscriptions")
    revalidatePath("/customer/dashboard")

    return {
      success: true,
      message: "Unsubscribed successfully",
      affectedRows: delete_subscriptions.affected_rows,
    }
  } catch (error) {
    console.error("Error unsubscribing from seller:", error)
    return {
      success: false,
      message: "Failed to unsubscribe. Please try again.",
    }
  }
}

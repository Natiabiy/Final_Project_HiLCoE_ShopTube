"use server"

import { adminClient, GET_PENDING_SELLERS, APPROVE_SELLER } from "@/lib/graphql-client"
import { revalidatePath } from "next/cache"

export async function getPendingSellers() {
  try {
    const { seller_profiles } = await adminClient.request(GET_PENDING_SELLERS)
    return { success: true, pendingSellers: seller_profiles }
  } catch (error) {
    console.error("Error fetching pending sellers:", error)
    return { success: false, error: "Failed to fetch pending sellers" }
  }
}

export async function approveSellerApplication(profileId: string) {
  try {
    const { update_seller_profiles_by_pk } = await adminClient.request(APPROVE_SELLER, {
      profileId,
    })

    revalidatePath("/admin/sellers")
    revalidatePath("/admin/dashboard")

    return {
      success: true,
      message: "Seller approved successfully",
      profile: update_seller_profiles_by_pk,
    }
  } catch (error) {
    console.error("Error approving seller:", error)
    return {
      success: false,
      message: "Failed to approve seller. Please try again.",
    }
  }
}

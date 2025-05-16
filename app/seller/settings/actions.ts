"use server"

import bcrypt from "bcryptjs"
import {
  adminClient,
  GET_USER_BY_ID,
  GET_SELLER_PROFILE,
  UPDATE_USER_PROFILE,
  UPDATE_SELLER_PROFILE,
  UPDATE_PASSWORD,
  GET_USER_BY_EMAIL,
} from "@/lib/graphql-client"

export async function getSellerProfile(userId: string) {
  try {
    // Get user data
    const userData = await adminClient.request(GET_USER_BY_ID, { userId })

    if (!userData.users_by_pk) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Get seller profile data
    const profileData = await adminClient.request(GET_SELLER_PROFILE, { userId })
    const sellerProfile = profileData.seller_profiles[0] || null

    return {
      success: true,
      user: userData.users_by_pk,
      profile: sellerProfile,
    }
  } catch (error) {
    console.error("Error fetching seller profile:", error)
    return {
      success: false,
      error: "Failed to fetch profile data",
    }
  }
}

export async function updateUserProfile(userId: string, name: string, email: string) {
  try {
    await adminClient.request(UPDATE_USER_PROFILE, { userId, name, email })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return {
      success: false,
      error: "Failed to update profile",
    }
  }
}

export async function updateSellerProfile(profileId: string, businessName: string, description: string) {
  try {
    await adminClient.request(UPDATE_SELLER_PROFILE, { profileId, businessName, description })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating seller profile:", error)
    return {
      success: false,
      error: "Failed to update business profile",
    }
  }
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Get user data to verify current password
    const userData = await adminClient.request(GET_USER_BY_ID, { userId })

    if (!userData.users_by_pk) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Get user with password hash
    const userWithPasswordData = await adminClient.request(GET_USER_BY_EMAIL, {
      email: userData.users_by_pk.email,
    })

    if (!userWithPasswordData.users[0]) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, userWithPasswordData.users[0].password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await adminClient.request(UPDATE_PASSWORD, { userId, passwordHash })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating password:", error)
    return {
      success: false,
      error: "Failed to update password",
    }
  }
}

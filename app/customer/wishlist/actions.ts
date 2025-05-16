"use server"

import {
  adminClient,
  createAuthClient,
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
  GET_USER_WISHLIST,
} from "@/lib/graphql-client"
import { headers } from "next/headers"
import { verifyJwt } from "@/lib/auth"

function getTokenFromHeader(): string | null {
  const headerList = headers()
  const authHeader = headerList.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }
  return null
}

export async function getUserWishlist(userId: string) {
  try {
    const token = getTokenFromHeader()
    const client = token ? createAuthClient(token) : adminClient

    const { wishlist_items } = await client.request(GET_USER_WISHLIST, { userId })

    return {
      success: true,
      wishlistItems: wishlist_items,
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return {
      success: false,
      error: "Failed to fetch wishlist",
    }
  }
}

export async function addToWishlist(userId: string, productId: string) {
  try {
    const token = getTokenFromHeader()
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      }
    }

    const payload = await verifyJwt(token)
    if (!payload || payload["x-hasura-user-id"] !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const client = createAuthClient(token)

    const { insert_wishlist_items_one } = await client.request(ADD_TO_WISHLIST, {
      userId,
      productId,
    })

    return {
      success: true,
      wishlistItem: insert_wishlist_items_one,
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return {
      success: false,
      error: "Failed to add item to wishlist",
    }
  }
}

export async function removeFromWishlist(wishlistItemId: string) {
  try {
    const token = getTokenFromHeader()
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      }
    }

    const client = createAuthClient(token)

    const { delete_wishlist_items_by_pk } = await client.request(REMOVE_FROM_WISHLIST, {
      wishlistItemId,
    })

    return {
      success: true,
      removedItem: delete_wishlist_items_by_pk,
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return {
      success: false,
      error: "Failed to remove item from wishlist",
    }
  }
}

"use server"

import {
  adminClient,
  GET_USER_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
} from "@/lib/graphql-client"
import { revalidatePath } from "next/cache"

export async function getUserCart(userId: string) {
  try {
    const { cart_items } = await adminClient.request(GET_USER_CART, { userId })
    return { success: true, cartItems: cart_items }
  } catch (error) {
    console.error("Error fetching user cart:", error)
    return { success: false, error: "Failed to fetch cart" }
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  try {
    const { insert_cart_items_one } = await adminClient.request(ADD_TO_CART, {
      userId,
      productId,
      quantity,
    })

    revalidatePath("/customer/cart")

    return {
      success: true,
      cartItemId: insert_cart_items_one.id,
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return {
      success: false,
      error: "Failed to add to cart. Please try again.",
    }
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    await adminClient.request(UPDATE_CART_ITEM, {
      cartItemId,
      quantity,
    })

    revalidatePath("/customer/cart")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return {
      success: false,
      error: "Failed to update cart. Please try again.",
    }
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await adminClient.request(REMOVE_FROM_CART, {
      cartItemId,
    })

    revalidatePath("/customer/cart")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return {
      success: false,
      error: "Failed to remove from cart. Please try again.",
    }
  }
}

export async function clearCart(userId: string) {
  try {
    await adminClient.request(CLEAR_CART, {
      userId,
    })

    revalidatePath("/customer/cart")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return {
      success: false,
      error: "Failed to clear cart. Please try again.",
    }
  }
}

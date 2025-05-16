"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./use-auth"
import { useToast } from "@/hooks/use-toast"
import { addToCart, removeFromCart, updateCartItem, clearCart } from "@/app/customer/cart/actions"

type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    stock: number
    image_url: string | null
    seller: {
      id: string
      name: string
      seller_profile: {
        business_name: string | null
      }
    }
  }
}

export function useCart() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({})

  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cart?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setCartItems(data.cartItems || [])
      } else {
        console.error("Error fetching cart:", data.error)
        setCartItems([])
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your cart",
          variant: "destructive",
        })
        return false
      }

      try {
        const result = await addToCart(user.id, productId, quantity)

        if (result.success) {
          toast({
            title: "Added to cart",
            description: "Item has been added to your cart",
          })
          fetchCart() // Refresh cart
          return true
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add item to cart",
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        console.error("Error adding to cart:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      }
    },
    [user?.id, toast, fetchCart],
  )

  const updateItem = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) return false

      setProcessingItems((prev) => ({ ...prev, [cartItemId]: true }))
      try {
        const result = await updateCartItem(cartItemId, quantity)
        if (result.success) {
          setCartItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))
          return true
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update cart",
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        console.error("Error updating cart item:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setProcessingItems((prev) => ({ ...prev, [cartItemId]: false }))
      }
    },
    [toast],
  )

  const removeItem = useCallback(
    async (cartItemId: string) => {
      setProcessingItems((prev) => ({ ...prev, [cartItemId]: true }))
      try {
        const result = await removeFromCart(cartItemId)
        if (result.success) {
          setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
          toast({
            title: "Success",
            description: "Item removed from cart",
          })
          return true
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove from cart",
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        console.error("Error removing cart item:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setProcessingItems((prev) => ({ ...prev, [cartItemId]: false }))
      }
    },
    [toast],
  )

  const clearAllItems = useCallback(async () => {
    if (!user?.id) return false

    try {
      const result = await clearCart(user.id)
      if (result.success) {
        setCartItems([])
        toast({
          title: "Success",
          description: "Cart cleared successfully",
        })
        return true
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to clear cart",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }, [user?.id, toast])

  const goToCart = useCallback(() => {
    router.push("/customer/cart")
  }, [router])

  const goToCheckout = useCallback(() => {
    router.push("/customer/checkout")
  }, [router])

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }, [cartItems])

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  return {
    cartItems,
    loading,
    processingItems,
    addItem,
    updateItem,
    removeItem,
    clearAllItems,
    goToCart,
    goToCheckout,
    calculateSubtotal,
    getCartItemCount,
    refreshCart: fetchCart,
  }
}

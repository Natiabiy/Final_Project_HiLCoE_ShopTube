"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
  id: string
  customer_id: string
  product_id: string
  created_at: string
}

export function useWishlist() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch wishlist items when user changes
  useEffect(() => {
    async function fetchWishlist() {
      if (!user) {
        setWishlistItems([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/wishlist?userId=${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching wishlist: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          setWishlistItems(data.wishlistItems || [])
        } else {
          setError(data.error || "Failed to fetch wishlist")
          setWishlistItems([])
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setWishlistItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user, token])

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some((item) => item.product_id === productId)
  }

  // Add a product to the wishlist
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error adding to wishlist: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update local state
        setWishlistItems((prev) => [
          ...prev,
          {
            id: data.wishlistItem.id,
            customer_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString(),
          },
        ])
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
        })
        return true
      } else {
        setError(data.error || "Failed to add to wishlist")
        toast({
          title: "Error",
          description: data.error || "Failed to add item to wishlist",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  // Remove a product from the wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user || !token) return false

    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error removing from wishlist: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update local state
        setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId))
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        })
        return true
      } else {
        setError(data.error || "Failed to remove from wishlist")
        toast({
          title: "Error",
          description: data.error || "Failed to remove item from wishlist",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  // Toggle a product in the wishlist
  const toggleWishlist = async (productId: string): Promise<boolean> => {
    return isInWishlist(productId) ? await removeFromWishlist(productId) : await addToWishlist(productId)
  }

  return {
    wishlistItems,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: () => {},
  }
}

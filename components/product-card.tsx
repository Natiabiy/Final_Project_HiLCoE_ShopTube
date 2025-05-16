"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { addToCart } from "@/app/customer/cart/actions"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    image_url: string
    seller_id: string
    created_at: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, token } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { toast } = useToast()
  const [isToggling, setIsToggling] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const isWishlisted = isInWishlist(product.id)

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    setIsToggling(true)
    try {
      const success = await toggleWishlist(product.id)

      if (success) {
        toast({
          title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
          description: isWishlisted
            ? `${product.name} has been removed from your wishlist`
            : `${product.name} has been added to your wishlist`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update wishlist. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)
    try {
      // Use the server action to add the item to cart
      const result = await addToCart(user.id, product.id, 1)

      if (result.success) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add to cart. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-video overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url || "/placeholder.svg?height=200&width=300"}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>
          <CardHeader className="p-4">
            <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-2 text-lg font-bold">${product.price.toFixed(2)}</p>
          </CardContent>
        </Link>

        {/* Wishlist button - positioned absolutely on the image */}
        <Button
          variant="secondary"
          size="icon"
          className={`absolute right-2 top-2 rounded-full bg-background/80 p-2 backdrop-blur-sm ${
            isWishlisted ? "text-red-500" : "text-muted-foreground"
          }`}
          onClick={handleWishlistToggle}
          disabled={isToggling}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={isWishlisted ? "fill-current" : ""} size={20} />
        </Button>
      </div>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock <= 0}
        >
          {isAddingToCart ? (
            <span className="flex items-center">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Adding...
            </span>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </Button>
        <Button variant="default" className="flex-1" asChild>
          <Link href={`/product/${product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

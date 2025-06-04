"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Heart, Minus, Package, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { getProductById } from "./actions"
import { addToCart } from "@/app/customer/cart/actions"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(id)
        if (result.success) {
          setProduct(result.product)
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, toast])

  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    if (product && value > product.stock) return
    setQuantity(value)
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    setIsAddingToCart(true)
    try {
      const result = await addToCart(user.id, product.id, quantity)

      if (result.success) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    setIsTogglingWishlist(true)
    try {
      await toggleWishlist(product.id)
      toast({
        title: isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist(product.id)
          ? `${product.name} has been removed from your wishlist`
          : `${product.name} has been added to your wishlist`,
      })
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase items",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    setIsAddingToCart(true)
    try {
      const result = await addToCart(user.id, product.id, quantity)

      if (result.success) {
        router.push("/customer/cart")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/marketplace">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold">{formatCurrency(product.price)}</p>

          <div>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="font-medium">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isAddingToCart}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={product.stock <= quantity || isAddingToCart}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button className="flex-1" onClick={handleAddToCart} disabled={product.stock <= 0 || isAddingToCart}>
                {isAddingToCart ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || isAddingToCart}
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
                className={isInWishlist(product.id) ? "text-red-500" : ""}
              >
                <Heart className={isInWishlist(product.id) ? "fill-current" : ""} />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="font-medium">Seller Information</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {product.seller?.seller_profile?.business_name || product.seller?.name || "Unknown Seller"}
                    </p>
                    <p className="text-sm text-muted-foreground">Seller ID: {product.seller_id}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/shop/${product.seller_id}`}>Visit Shop</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

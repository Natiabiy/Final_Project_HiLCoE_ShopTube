"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/product-card"

interface WishlistProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  seller_id: string
  created_at: string
}

export default function CustomerWishlist() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { wishlistItems, loading: loadingWishlist, refreshWishlist } = useWishlist()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!wishlistItems.length) {
        setProducts([])
        setLoadingProducts(false)
        return
      }

      setLoadingProducts(true)
      try {
        const productIds = wishlistItems.map((item) => item.product_id)
        const response = await fetch(`/api/products/batch?ids=${productIds.join(",")}`)
        const data = await response.json()

        if (data.success) {
          setProducts(data.products)
        }
      } catch (error) {
        console.error("Error fetching wishlist products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (!loadingWishlist) {
      fetchWishlistProducts()
    }
  }, [wishlistItems, loadingWishlist])

  // useEffect(() => {
  //   // Refresh wishlist when component mounts
  //   refreshWishlist()
  // }, [refreshWishlist])

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <CustomerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Wishlist</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingProducts ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-6 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full mt-4" />
                  </div>
                </Card>
              ))
          ) : products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Your wishlist is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Save your favorite products to your wishlist for easy access later.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bell, BellOff, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { checkUserSubscribed, getSellerWithProducts } from "./actions"
import { subscribeToSeller, unsubscribeFromSeller } from "@/app/customer/subscriptions/actions"

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string | null
  created_at: string
}

type SellerProfile = {
  id: string
  business_name: string
  description: string
}

type Seller = {
  id: string
  name: string
  seller_profile: SellerProfile
  products: Product[]
}

export default function ShopPage() {
  const params = useParams()
  const sellerId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const result = await getSellerWithProducts(sellerId)
        if (result.success) {
          setSeller(result.seller)

          // Check if user is subscribed to this seller
          if (user) {
            const subResult = await checkUserSubscribed(user.id, sellerId)
            if (subResult.success) {
              setIsSubscribed(subResult.isSubscribed)
            }
          }
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching seller:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSeller()
  }, [sellerId, toast, user])

  const filteredProducts =
    seller?.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const handleSubscribe = async () => {
    if (!user || !seller) return

    setSubscribing(true)
    try {
      if (isSubscribed) {
        const result = await unsubscribeFromSeller(user.id, seller.id)

        if (result.success) {
          setIsSubscribed(false)
          toast({
            title: "Unsubscribed",
            description: `You have unsubscribed from ${seller.seller_profile.business_name}`,
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      } else {
        const result = await subscribeToSeller(user.id, seller.id)

        if (result.success) {
          setIsSubscribed(true)
          toast({
            title: "Subscribed",
            description: `You are now subscribed to ${seller.seller_profile.business_name}`,
          })
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error subscribing/unsubscribing:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading shop...</p>
          </div>
        ) : !seller ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold">Shop not found</h2>
            <p className="text-muted-foreground mt-2">The shop you're looking for doesn't exist or has been removed.</p>
            <Link href="/marketplace">
              <Button variant="link" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <Link href="/marketplace">
                <Button variant="ghost" className="w-fit">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Button>
              </Link>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{seller.seller_profile.business_name}</h1>
                  <p className="text-muted-foreground mt-1">By {seller.name}</p>
                </div>
                {user && user.role === "customer" && (
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    variant={isSubscribed ? "outline" : "default"}
                  >
                    {subscribing ? (
                      "Processing..."
                    ) : isSubscribed ? (
                      <>
                        <BellOff className="mr-2 h-4 w-4" />
                        Unsubscribe
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Subscribe
                      </>
                    )}
                  </Button>
                )}
              </div>
              {seller.seller_profile.description && (
                <p className="text-muted-foreground">{seller.seller_profile.description}</p>
              )}
              <Separator />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold">Products</h2>
                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No products found</h3>
                  {seller.products.length === 0 ? (
                    <p className="text-muted-foreground mt-2">This shop hasn't added any products yet.</p>
                  ) : (
                    <p className="text-muted-foreground mt-2">Try a different search term.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <Link href={`/product/${product.id}`}>
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={product.image_url || `/placeholder.svg?height=200&width=300`}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                        </CardHeader>
                      </Link>
                      <CardContent>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        <p className="mt-2 text-lg font-bold">ETB {product.price.toFixed(2)}</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" disabled={product.stock <= 0}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

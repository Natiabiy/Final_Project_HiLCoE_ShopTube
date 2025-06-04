"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getUserCart, updateCartItem, removeFromCart, clearCart } from "./actions"

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
      seller_profiles: {
        business_name: string | null
      }
    }
  }
}

export default function CustomerCartPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({})
  const [processingCheckout, setProcessingCheckout] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) return

      try {
        const result = await getUserCart(user.id)
        if (result.success) {
          setCartItems(result.cartItems)
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast({
          title: "Error",
          description: "Failed to load cart",
          variant: "destructive",
        })
      } finally {
        setLoadingCart(false)
      }
    }

    if (user) {
      fetchCart()
    }
  }, [user, toast])

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setProcessingItems((prev) => ({ ...prev, [cartItemId]: true }))
    try {
      const result = await updateCartItem(cartItemId, newQuantity)
      if (result.success) {
        setCartItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)))
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating cart item:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingItems((prev) => ({ ...prev, [cartItemId]: false }))
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    setProcessingItems((prev) => ({ ...prev, [cartItemId]: true }))
    try {
      const result = await removeFromCart(cartItemId)
      if (result.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
        toast({
          title: "Success",
          description: "Item removed from cart",
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing cart item:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingItems((prev) => ({ ...prev, [cartItemId]: false }))
    }
  }

  const handleClearCart = async () => {
    if (!user) return

    setProcessingCheckout(true)
    try {
      const result = await clearCart(user.id)
      if (result.success) {
        setCartItems([])
        toast({
          title: "Success",
          description: "Cart cleared successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingCheckout(false)
    }
  }

  const handleCheckout = () => {
    router.push("/customer/checkout")
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount)
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <CustomerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h2>
          <Button asChild>
            <Link href="/marketplace">Continue Shopping</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {loadingCart ? (
              <div className="space-y-4">
                <Skeleton className="h-[150px] w-full" />
                <Skeleton className="h-[150px] w-full" />
                <Skeleton className="h-[150px] w-full" />
              </div>
            ) : cartItems.length > 0 ? (
              cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 rounded-md bg-muted overflow-hidden">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url || "/placeholder.svg"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                          <div>
                            <Link href={`/product/${item.product.id}`} className="font-medium hover:underline">
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Sold by:{" "}
                              <Link href={`/shop/${item.product.seller.id}`} className="hover:underline">
                                {item.product.seller.seller_profiles.business_name || item.product.seller.name}
                              </Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.product.stock > 0 ? `${item.product.stock} in stock` : "Out of stock"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.product.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={processingItems[item.id] || item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={processingItems[item.id] || item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={processingItems[item.id]}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Your cart is empty</h3>
                  <p className="text-muted-foreground mt-1">Add items to your cart to checkout</p>
                  <Button className="mt-4" asChild>
                    <Link href="/marketplace">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order before checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || processingCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearCart}
                  disabled={cartItems.length === 0 || processingCheckout}
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

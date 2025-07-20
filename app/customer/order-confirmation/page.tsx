"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ChevronLeft, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)

  const orderId = searchParams.get("orderId")
  const txRef = searchParams.get("tx_ref")

  // Redirect if user is not logged in
  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // 🔄 Verify Chapa payment and create order if tx_ref exists and no orderId yet
  useEffect(() => {
    const handleOrderCreation = async () => {
      try {
        const response = await fetch(`/api/chapa/verify/${txRef}`)
        const data = await response.json()

        if (data.success && data.orderId) {
          router.replace(`/customer/order-confirmation?orderId=${data.orderId}`)
        } else {
          toast({
            title: "Order Error",
            description: data.error || "Failed to verify payment",
            variant: "destructive",
          })
          router.push("/customer/orders")
        }
      } catch (err) {
        console.error("Order creation error:", err)
        toast({
          title: "Unexpected Error",
          description: "Could not verify payment or create order.",
          variant: "destructive",
        })
        router.push("/customer/orders")
      }
    }

    if (user && txRef && !orderId) {
      handleOrderCreation()
    }
  }, [user, txRef, orderId, router, toast])

  // Fetch order details if orderId is present
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user?.id) return

      try {
        const response = await fetch(`/api/orders/${orderId}?userId=${user.id}`)
        const data = await response.json()

        if (data.success) {
          setOrderDetails(data.order)
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch order details",
            variant: "destructive",
          })
          router.push("/customer/orders")
        }
      } catch (error) {
        console.error("Error fetching order details:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        router.push("/customer/orders")
      } finally {
        setLoadingOrder(false)
      }
    }

    if (user && orderId) {
      fetchOrderDetails()
    }
  }, [orderId, user, toast, router])

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <CustomerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customer/orders">
              <ChevronLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <Card className="mx-auto max-w-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your order has been received and is being processed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loadingOrder ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Order Number</p>
                      <p className="text-lg font-bold">{orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm">
                        {orderDetails?.created_at
                          ? new Date(orderDetails.created_at).toLocaleDateString()
                          : "Processing"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm capitalize">{orderDetails?.status || "pending"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-lg font-bold">
                        ${orderDetails?.total_amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Order Items</h3>
                  <div className="space-y-3">
                    {orderDetails?.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.price_per_unit?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.quantity * item.price_per_unit).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Shipping Address</h3>
                  <p className="rounded-lg border p-4 text-sm">
                    {orderDetails?.shipping_address || "No shipping address provided"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span>${orderDetails?.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${orderDetails?.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" asChild>
              <Link href="/customer/orders">View All Orders</Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/marketplace">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </CustomerLayout>
  )
}

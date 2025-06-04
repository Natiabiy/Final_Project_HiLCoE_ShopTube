"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { getUserOrders } from "./actions"

export default function CustomerOrders() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return

      try {
        const result = await getUserOrders(user.id)
        if (result.success) {
          setOrders(result.orders)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

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
          <h2 className="text-3xl font-bold tracking-tight">Your Orders</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/marketplace">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {loadingOrders ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.created_at).toLocaleDateString()} • {order.status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? "s" : ""}
                    </p>
                    <p className="font-medium">Total: {formatCurrency(Number(order.total_amount))}</p>
                  </div>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 border rounded-md p-3">
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name || "Product"}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(Number(item.price_per_unit))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your order history will appear here once you make a purchase.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/marketplace">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getCustomerDashboardStats } from "./actions"
import { getUserOrders } from "../orders/actions"
import { getCustomerSubscriptions } from "../subscriptions/actions"

export default function CustomerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        const result = await getCustomerDashboardStats(user.id)
        if (result.success) {
          setStats(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, toast])

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

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?.id) return

      try {
        const result = await getCustomerSubscriptions(user.id)
        if (result.success) {
          setSubscriptions(result.subscriptions)
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
      } finally {
        setLoadingSubscriptions(false)
      }
    }

    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <CustomerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{user.name}'s Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>Shops you follow</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.subscriptions_aggregate?.aggregate?.count || 0}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/customer/subscriptions">View All</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Your purchase history</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.orders_aggregate?.aggregate?.count || 0}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/customer/orders">View All</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Marketplace</CardTitle>
                  <CardDescription>Discover new products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">Explore</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/marketplace">Browse</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 border rounded-md p-4">
                          <Package className="h-10 w-10 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} • {order.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">ETB {Number(order.total_amount).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{order.order_items?.length || 0} item(s)</p>
                          </div>
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/customer/orders">View All Orders</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your order history will appear here once you make a purchase.
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/marketplace">Start Shopping</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Subscribed Shops</CardTitle>
                  <CardDescription>Your favorite shops</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSubscriptions ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {subscriptions.slice(0, 3).map((subscription) => (
                        <div key={subscription.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted"></div>
                            <div>
                              <p className="font-medium">{subscription.seller?.name || "Shop"}</p>
                              <p className="text-sm text-muted-foreground">
                                Subscribed on {new Date(subscription.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/shop/${subscription.seller_id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                      {subscriptions.length > 3 && (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/customer/subscriptions">View All Subscriptions</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No subscriptions yet. Explore shops to subscribe!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-md overflow-hidden">
                        <div className="bg-muted p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {order.status}
                            </div>
                            <div className="font-medium">ETB {Number(order.total_amount).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-md bg-muted"></div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name || "Product"}</p>
                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">ETB {Number(item.price_per_unit).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your order history will appear here once you make a purchase.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/marketplace">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscriptions</CardTitle>
                <CardDescription>View and manage your subscribed shops</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubscriptions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border rounded-md p-4"
                      >
                        <div>
                          <h3 className="font-medium">{subscription.seller?.name || "Shop"}</h3>
                          <p className="text-sm text-muted-foreground">
                            Subscribed on {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/shop/${subscription.seller_id}`}>Visit Shop</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="mt-4 text-lg font-medium">No subscriptions yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Subscribe to sellers to get updates on their new products.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/marketplace">Explore Marketplace</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  )
}

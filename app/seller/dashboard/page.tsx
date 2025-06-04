"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SellerLayout } from "@/components/layouts/seller-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getSellerDashboardStats } from "./actions"
import { getSellerProducts } from "../products/actions"

type DashboardStats = {
  totalSales: number
  productCount: number
  subscriberCount: number
  recentOrders: any[]
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string | null
  created_at: string
}

export default function SellerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "seller")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        // Fetch dashboard stats
        const statsResult = await getSellerDashboardStats(user.id)
        if (statsResult.success) {
          setStats(statsResult.stats)
        } else {
          toast({
            title: "Error",
            description: statsResult.error || "Failed to load dashboard statistics",
            variant: "destructive",
          })
        }

        // Fetch products
        const productsResult = await getSellerProducts(user.id)
        if (productsResult.success) {
          setProducts(productsResult.products)
        } else {
          toast({
            title: "Error",
            description: productsResult.error || "Failed to load products",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <SellerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Seller Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/seller/products/new">Add New Product</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                      <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-6 w-24 animate-pulse bg-muted rounded mb-1"></div>
                      <div className="h-4 w-32 animate-pulse bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalSales || 0)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime sales value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.productCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Total products in your shop</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.subscriberCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Customers subscribed to your shop</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.subscriberCount && stats.subscriberCount > 0
                        ? ((stats?.totalSales || 0) / (stats?.subscriberCount || 1)).toFixed(2)
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">Avg. sales per subscriber</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    {isLoading ? (
                      <div className="h-full w-full animate-pulse bg-muted rounded"></div>
                    ) : (
                      "Sales chart will be displayed here"
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>You have {stats?.recentOrders?.length || 0} recent orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <div className="h-5 w-24 animate-pulse bg-muted rounded mb-1"></div>
                            <div className="h-4 w-16 animate-pulse bg-muted rounded"></div>
                          </div>
                          <div>
                            <div className="h-5 w-16 animate-pulse bg-muted rounded mb-1 text-right"></div>
                            <div className="h-4 w-12 animate-pulse bg-muted rounded text-right"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stats?.recentOrders?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No recent orders found</div>
                  ) : (
                    <div className="space-y-4">
                      {stats?.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-right">{formatCurrency(order.total_amount)}</p>
                            <p className="text-sm text-muted-foreground text-right">
                              {order.order_items_aggregate.aggregate.count} items
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/seller/orders">View All Orders</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add, edit, and manage your products</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-12 w-full animate-pulse bg-muted rounded"></div>
                    <div className="h-64 w-full animate-pulse bg-muted rounded"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start adding products to your shop to attract customers.
                    </p>
                    <Button asChild>
                      <Link href="/seller/products/new">Add Your First Product</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p>You have {products.length} products in your shop</p>
                      <Button asChild>
                        <Link href="/seller/products">Manage Products</Link>
                      </Button>
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {products.slice(0, 3).map((product) => (
                        <Card key={product.id}>
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={product.image_url || `/placeholder.svg?height=200&width=300`}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex justify-between">
                              <span className="font-bold">{formatCurrency(product.price)}</span>
                              <span className="text-muted-foreground">Stock: {product.stock}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {products.length > 3 && (
                      <div className="text-center">
                        <Button variant="outline" asChild>
                          <Link href="/seller/products">View All Products</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View and manage all your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4">
                      <div className="text-center">
                        <Link href="/seller/orders">
                          <Button>Go to Orders Management</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>View and engage with your subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4">
                      <div className="text-center">
                        <Link href="/seller/subscribers">
                          <Button>Go to Subscriber Management</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  )
}

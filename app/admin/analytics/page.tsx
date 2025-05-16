"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  LineChart,
  PieChart,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import AdminLayout from "@/components/layouts/admin-layout"
import { getAnalyticsData } from "./actions"

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [timeframe, setTimeframe] = useState("30days")
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadAnalytics = async () => {
      if (user && user.role === "admin") {
        try {
          setIsLoading(true)
          const result = await getAnalyticsData(timeframe)
          if (result.success) {
            setAnalyticsData(result.data)
          } else {
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error loading analytics:", error)
          toast({
            title: "Error",
            description: "Failed to load analytics data. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadAnalytics()
  }, [user, timeframe, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : formatCurrency(analyticsData?.revenue?.total || 0)}
                  </div>
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">+{isLoading ? "..." : analyticsData?.revenue?.growth || 0}%</span>
                    <span className="ml-1">from previous period</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "Loading..." : analyticsData?.users?.new || 0}</div>
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">+{isLoading ? "..." : analyticsData?.users?.growth || 0}%</span>
                    <span className="ml-1">from previous period</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : analyticsData?.products?.new || 0}
                  </div>
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">+{isLoading ? "..." : analyticsData?.products?.growth || 0}%</span>
                    <span className="ml-1">from previous period</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : analyticsData?.sellers?.active || 0}
                  </div>
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    <span>{isLoading ? "..." : analyticsData?.sellers?.total || 0} total sellers</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] flex items-center justify-center">
                    {isLoading ? (
                      <p>Loading chart data...</p>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border rounded-md bg-muted/10">
                        <LineChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Revenue chart will be displayed here</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products with the most sales</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading top products...</p>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Product Name {i}</p>
                            <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 100)} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Math.random() * 1000)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user types</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center">
                    {isLoading ? (
                      <p>Loading chart data...</p>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border rounded-md bg-muted/10">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">
                          User distribution chart will be displayed here
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>Products by category</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center">
                    {isLoading ? (
                      <p>Loading chart data...</p>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border rounded-md bg-muted/10">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Category chart will be displayed here</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Growth</CardTitle>
                  <CardDescription>New subscriptions over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center">
                    {isLoading ? (
                      <p>Loading chart data...</p>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border rounded-md bg-muted/10">
                        <LineChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Subscription chart will be displayed here</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/10">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Detailed revenue analytics will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>User growth and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/10">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">User analytics will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Analytics</CardTitle>
                <CardDescription>Product performance and inventory metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/10">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Product analytics will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

import { Suspense } from "react"
import Link from "next/link"
import { Activity, Users, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  getDashboardStats,
  getPendingSellerApplications,
  getRecentProducts,
  getRecentUsers,
  formatCurrency,
  formatDate,
} from "./actions"
import AdminLayout from "@/components/layouts/admin-layout"

async function DashboardStats() {
  const { success, stats, error } = await getDashboardStats()

  if (!success) {
    return <div className="bg-red-50 p-4 rounded-lg text-red-500">Error loading dashboard statistics: {error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Registered users on the platform</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSellers}</div>
          <p className="text-xs text-muted-foreground">Approved seller accounts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">Products available for purchase</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.platformRevenue)}</div>
          <p className="text-xs text-muted-foreground">Total revenue generated</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function PendingSellerApplications() {
  const { success, pendingSellers, error } = await getPendingSellerApplications()

  if (!success) {
    return <div className="bg-red-50 p-4 rounded-lg text-red-500">Error loading pending applications: {error}</div>
  }

  if (pendingSellers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Seller Applications</CardTitle>
          <CardDescription>No pending applications at this time</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6 text-muted-foreground">
          All seller applications have been processed
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Seller Applications</CardTitle>
        <CardDescription>Sellers waiting for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingSellers.map((seller: any) => (
            <div key={seller.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{seller.business_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {seller.user.name} • {seller.user.email}
                </p>
                <p className="text-xs text-muted-foreground">Applied {formatDate(seller.created_at)}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Approve">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="sr-only">Approve</span>
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Reject">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Reject</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/admin/sellers">
            View all applications
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function PendingSellersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-56 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}

async function RecentProducts() {
  const { success, recentProducts, error } = await getRecentProducts()

  if (!success) {
    return <div className="bg-red-50 p-4 rounded-lg text-red-500">Error loading recent products: {error}</div>
  }

  if (recentProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>No products have been added yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6 text-muted-foreground">
          Products will appear here once sellers add them
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
        <CardDescription>Latest products added to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProducts.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">By {product.seller?.name || "Unknown Seller"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{formatCurrency(product.price)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {formatDate(product.created_at)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/admin/products">
            View all products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function RecentProductsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}

async function RecentUsers() {
  const { success, recentUsers, error } = await getRecentUsers()

  if (!success) {
    return <div className="bg-red-50 p-4 rounded-lg text-red-500">Error loading recent users: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest users who joined the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role === "admin" ? "destructive" : user.role === "seller" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentUsersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <Activity className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/analytics?tab=revenue">
              <DollarSign className="mr-2 h-4 w-4" />
              Revenue
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<PendingSellersSkeleton />}>
            <PendingSellerApplications />
          </Suspense>

          <Suspense fallback={<RecentProductsSkeleton />}>
            <RecentProducts />
          </Suspense>
        </div>

        <Suspense fallback={<RecentUsersSkeleton />}>
          <RecentUsers />
        </Suspense>
      </div>
    </AdminLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { getCustomerSubscriptions } from "./actions"

export default function CustomerSubscriptions() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

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
          <h2 className="text-3xl font-bold tracking-tight">Your Subscriptions</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingSubscriptions ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
          ) : subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardHeader>
                  <CardTitle>{subscription.seller?.name || "Shop"}</CardTitle>
                  <CardDescription>
                    Subscribed on {new Date(subscription.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/shop/${subscription.seller_id}`}>Visit Shop</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Store className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No subscriptions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Subscribe to sellers to get updates on their new products.
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

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Package, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerLayout } from "@/components/layouts/customer-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { notifications, unreadCount, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleNotificationClick = async (notificationId: string, isRead: boolean, productId?: string) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }

    if (productId) {
      router.push(`/product/${productId}`)
    }
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <CustomerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with your subscribed sellers and orders</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read ({unreadCount})
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              All Notifications
            </CardTitle>
            <CardDescription>
              {notifications.length === 0
                ? "No notifications yet"
                : `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Subscribe to sellers to get notified when they add new products.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.is_read ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(notification.id, notification.is_read, notification.product_id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {notification.type === "new_product" ? (
                          <Package className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Bell className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.seller && (
                          <p className="text-xs text-gray-500 mt-2">From: {notification.seller.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  )
}

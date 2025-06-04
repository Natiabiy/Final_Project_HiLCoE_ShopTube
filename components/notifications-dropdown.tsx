"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications()
  const [open, setOpen] = useState(false)

  useEffect(() => {
   // console.log("Dropdown open state:", open);
    if (open) {
       // console.log("Calling refetch...");
      refetch()
    }
  }, [open, refetch])

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {
 <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button> }
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-1 text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-0 ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification.id, notification.is_read)}
              >
                <div className="flex w-full p-3">
                  <div className="flex-shrink-0 mr-3">
                    {notification.type === "new_product" ? (
                      <Package className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Bell className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/customer/notifications" className="w-full text-center">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

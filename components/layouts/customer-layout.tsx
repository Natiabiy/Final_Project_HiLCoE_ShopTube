"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Heart, Home, LogOut, Settings, ShoppingBag, ShoppingCart, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"

export function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/customer/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/customer/dashboard",
    },
    {
      href: "/customer/subscriptions",
      label: "Subscriptions",
      icon: Store,
      active: pathname === "/customer/subscriptions",
    },
    {
      href: "/customer/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname === "/customer/orders",
    },
    {
      href: "/customer/wishlist",
      label: "Wishlist",
      icon: Heart,
      active: pathname === "/customer/wishlist",
    },
    {
      href: "/customer/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/customer/settings",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-6 w-6" />
          <span className="hidden md:inline-block">ShopTube</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="p-4 border-b">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <p className="font-medium truncate">{user?.name || "Customer"}</p>
          </div>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  route.active ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

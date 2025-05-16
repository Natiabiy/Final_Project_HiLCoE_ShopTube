"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, Home, LogOut, Settings, ShoppingBag, Store, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/sellers",
      label: "Sellers",
      icon: Store,
      active: pathname === "/admin/sellers",
    },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: Users,
      active: pathname === "/admin/customers",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname === "/admin/analytics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-6 w-6" />
          <span className="hidden md:inline-block">ShopTube Admin</span>
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

export default AdminLayout

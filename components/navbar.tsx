"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, Heart, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/hooks/use-auth"
import { useCart } from "@/lib/hooks/use-cart"
import { useWishlist } from "@/lib/hooks/use-wishlist"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { wishlistItems } = useWishlist()
  const { getCartItemCount } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't render counts until client-side
  if (!isMounted) {
    return null
  }

  const cartItemCount = getCartItemCount()
  const wishlistItemCount = wishlistItems.length

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b ${
        isScrolled ? "bg-background/80 backdrop-blur-md" : "bg-background"
      } transition-all duration-200`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ShopTube</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/marketplace"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/marketplace") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/explore") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Button variant="ghost" size="icon" asChild className="relative">
                    <Link href="/customer/wishlist">
                      <Heart className="h-5 w-5" />
                      {wishlistItemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {wishlistItemCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="relative">
                    <Link href="/customer/cart">
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                </>
              )}

              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "seller"
                          ? "/seller/dashboard"
                          : "/customer/dashboard"
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/") ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/marketplace"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/marketplace") ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/explore"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/explore") ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Explore
                </Link>

                {user ? (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      href={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : user.role === "seller"
                            ? "/seller/dashboard"
                            : "/customer/dashboard"
                      }
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                    {user.role === "customer" && (
                      <>
                        <Link
                          href="/customer/wishlist"
                          className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                          {wishlistItemCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {wishlistItemCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/customer/cart"
                          className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Cart
                          {cartItemCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {cartItemCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    <button
                      onClick={logout}
                      className="text-sm font-medium transition-colors hover:text-primary text-left flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
                      Login
                    </Link>
                    <Link href="/auth/signup" className="text-sm font-medium transition-colors hover:text-primary">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

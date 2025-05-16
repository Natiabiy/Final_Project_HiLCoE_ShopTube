"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/layouts/admin-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { adminClient, GET_PRODUCTS } from "@/lib/graphql-client"

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string | null
  created_at: string
  seller: {
    name: string
    seller_profile: {
      business_name: string
    }
  }
}

export default function AdminProductsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products } = await adminClient.request(GET_PRODUCTS)
        setProducts(products)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (user && user.role === "admin") {
      fetchProducts()
    }
  }, [user])

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      </div>

      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <h2 className="text-xl font-medium mb-2">Products Management</h2>
        <p className="text-muted-foreground mb-4">
          This page will display all products with filtering and sorting options.
        </p>
        <p className="text-sm text-muted-foreground">Coming soon in the next implementation phase.</p>
      </div>
    </AdminLayout>
  )
}

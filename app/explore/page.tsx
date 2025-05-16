import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  seller_id: string
  seller?: {
    id: string
    name: string
    seller_profile?: {
      business_name: string | null
    }
  }
}

const ProductCard = ({ product }: { product: Product }) => {
  // Add null checks and default values
  if (!product) return null

  // Get seller name and business name with fallbacks
  const sellerName = product.seller?.name || "Unknown Seller"
  const businessName = product.seller?.seller_profile?.business_name || sellerName
  const sellerId = product.seller_id || ""

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Product Image - Links to product detail */}
      <Link href={`/product/${product.id}`} className="block aspect-video w-full overflow-hidden">
        <img
          src={product.image_url || `/placeholder.svg?height=200&width=300`}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </Link>

      {/* Product Title - Links to product detail */}
      <CardHeader className="pb-2">
        <Link href={`/product/${product.id}`}>
          <CardTitle className="hover:underline">{product.name}</CardTitle>
        </Link>

        {/* Seller info - Links to shop */}
        <CardDescription>
          By{" "}
          {sellerId ? (
            <Link href={`/shop/${sellerId}`} className="hover:underline">
              {businessName}
            </Link>
          ) : (
            <span>{businessName}</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 line-clamp-2">{product.description || "No description available"}</p>
        <p className="mt-2 text-lg font-bold">${(product.price || 0).toFixed(2)}</p>
      </CardContent>

      <CardFooter className="flex justify-between mt-auto">
        <Button size="sm" variant="outline">
          <Heart className="h-4 w-4 mr-2" />
          Wishlist
        </Button>
        <Button size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard

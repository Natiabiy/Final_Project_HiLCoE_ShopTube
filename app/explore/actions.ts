"use server"

import { adminClient, GET_PRODUCTS } from "@/lib/graphql-client"

export async function getProducts() {
  try {
    const { products } = await adminClient.request(GET_PRODUCTS)

    // Map products to ensure they have all required fields
    const mappedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price || 0,
      image_url: product.image_url || null,
      seller_id: product.seller_id,
      created_at: product.created_at,
      // Ensure seller object exists with required fields
      seller: product.seller
        ? {
            id: product.seller.id,
            name: product.seller.name || "Unknown Seller",
            seller_profile: product.seller.seller_profile
              ? {
                  business_name: product.seller.seller_profile.business_name || "Unknown Business",
                }
              : {
                  business_name: "Unknown Business",
                },
          }
        : {
            id: product.seller_id,
            name: "Unknown Seller",
            seller_profile: {
              business_name: "Unknown Business",
            },
          },
    }))

    return { success: true, products: mappedProducts }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

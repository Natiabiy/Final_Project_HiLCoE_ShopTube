"use server"

import { adminClient, GET_SELLER_PRODUCTS, CREATE_PRODUCT } from "@/lib/graphql-client"
import { revalidatePath } from "next/cache"

export async function getSellerProducts(sellerId: string) {
  try {
    const { products } = await adminClient.request(GET_SELLER_PRODUCTS, { sellerId })
    return { success: true, products }
  } catch (error) {
    console.error("Error fetching seller products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const sellerId = formData.get("sellerId") as string
    const imageUrl = (formData.get("imageUrl") as string) || null

    if (!name || !description || isNaN(price) || isNaN(stock) || !sellerId) {
      return { success: false, message: "Invalid product data" }
    }

    const { insert_products_one } = await adminClient.request(CREATE_PRODUCT, {
      name,
      description,
      price,
      stock,
      sellerId,
      imageUrl,
    })

    revalidatePath("/seller/products")
    revalidatePath("/seller/dashboard")

    return {
      success: true,
      message: "Product created successfully",
      product: insert_products_one,
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return {
      success: false,
      message: "Failed to create product. Please try again.",
    }
  }
}

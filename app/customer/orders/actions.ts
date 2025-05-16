"use server"

import { adminClient, GET_USER_ORDERS, CREATE_ORDER, GET_USER_BY_ID, GET_PRODUCT_BY_ID } from "@/lib/graphql-client"
import { revalidatePath } from "next/cache"

export async function getUserOrders(userId: string) {
  try {
    const { orders } = await adminClient.request(GET_USER_ORDERS, { userId })

    // Enhance order items with additional product and seller details
    const enhancedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const enhancedOrderItems = await Promise.all(
          order.order_items.map(async (item: any) => {
            try {
              const { products_by_pk } = await adminClient.request(GET_PRODUCT_BY_ID, {
                productId: item.product.id,
              })

              // Fetch seller details
              const { users_by_pk } = await adminClient.request(GET_USER_BY_ID, {
                userId: products_by_pk.seller_id,
              })

              return {
                ...item,
                product: {
                  ...item.product,
                  seller: users_by_pk,
                },
              }
            } catch (error) {
              console.error("Error fetching product or seller details:", error)
              return item
            }
          }),
        )

        return {
          ...order,
          order_items: enhancedOrderItems,
        }
      }),
    )

    return { success: true, orders: enhancedOrders }
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function createOrder(
  userId: string,
  totalAmount: number,
  shippingAddress: string,
  orderItems: Array<{
    product_id: string
    quantity: number
    price_per_unit: number
  }>,
) {
  try {
    const { insert_orders_one } = await adminClient.request(CREATE_ORDER, {
      userId,
      totalAmount,
      status: "pending",
      shippingAddress,
      orderItems,
    })

    revalidatePath("/customer/orders")
    revalidatePath("/customer/dashboard")

    return {
      success: true,
      orderId: insert_orders_one.id,
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return {
      success: false,
      error: "Failed to create order. Please try again.",
    }
  }
}

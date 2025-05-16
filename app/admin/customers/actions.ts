"use server"

import { adminClient, gql } from "@/lib/graphql-client"

// Get all customers with their subscription and order counts
const GET_CUSTOMERS = gql`
  query GetCustomers {
    users(where: {role: {_eq: "customer"}}) {
      id
      name
      email
      created_at
      subscriptions_aggregate {
        aggregate {
          count
        }
      }
      orders_aggregate {
        aggregate {
          count
          sum {
            total_amount
          }
        }
      }
    }
  }
`

export async function getCustomers() {
  try {
    const data = await adminClient.request(GET_CUSTOMERS)

    const customers = data.users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      subscription_count: user.subscriptions_aggregate.aggregate.count,
      order_count: user.orders_aggregate.aggregate.count,
      total_spent: user.orders_aggregate.aggregate.sum?.total_amount || 0,
    }))

    return {
      success: true,
      customers,
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return {
      success: false,
      error: "Failed to fetch customers",
    }
  }
}

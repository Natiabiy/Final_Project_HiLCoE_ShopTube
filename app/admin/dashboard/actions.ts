"use server"

import { adminClient, gql } from "@/lib/graphql-client"

// Dashboard statistics query
const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    users_aggregate {
      aggregate {
        count
      }
    }
    seller_profiles_aggregate {
      aggregate {
        count
      }
    }
    products_aggregate {
      aggregate {
        count
      }
    }
    orders_aggregate {
      aggregate {
        sum {
          total_amount
        }
      }
    }
  }
`

// Pending sellers query - Fixed field name from business_description to description
const GET_PENDING_SELLERS = gql`
  query GetPendingSellers {
    seller_profiles(where: {is_approved: {_eq: false}}, order_by: {created_at: desc}) {
      id
      business_name
      description
      user_id
      created_at
      user {
        name
        email
      }
    }
  }
`

// Recent users query
const GET_RECENT_USERS = gql`
  query GetRecentUsers($limit: Int!) {
    users(order_by: {created_at: desc}, limit: $limit) {
      id
      name
      email
      role
      created_at
    }
  }
`

// Recent products query
const GET_RECENT_PRODUCTS = gql`
  query GetRecentProducts($limit: Int!) {
    products(order_by: {created_at: desc}, limit: $limit) {
      id
      name
      price
      stock
      created_at
      seller_id
    }
  }
`

// Get user by ID query
const GET_USER_BY_ID = gql`
  query GetUserById($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      name
      email
    }
  }
`

export async function getDashboardStats() {
  try {
    const data = await adminClient.request(GET_ADMIN_DASHBOARD_STATS)

    return {
      success: true,
      stats: {
        totalUsers: data.users_aggregate.aggregate.count,
        activeSellers: data.seller_profiles_aggregate.aggregate.count,
        totalProducts: data.products_aggregate.aggregate.count,
        platformRevenue: data.orders_aggregate.aggregate.sum?.total_amount || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    }
  }
}

export async function getPendingSellerApplications(limit = 3) {
  try {
    const { seller_profiles } = await adminClient.request(GET_PENDING_SELLERS)

    return {
      success: true,
      pendingSellers: seller_profiles.slice(0, limit),
    }
  } catch (error) {
    console.error("Error fetching pending sellers:", error)
    return {
      success: false,
      error: "Failed to fetch pending seller applications",
    }
  }
}

export async function getRecentUsers(limit = 5) {
  try {
    const data = await adminClient.request(GET_RECENT_USERS, { limit })

    return {
      success: true,
      recentUsers: data.users,
    }
  } catch (error) {
    console.error("Error fetching recent users:", error)
    return {
      success: false,
      error: "Failed to fetch recent users",
    }
  }
}

export async function getRecentProducts(limit = 5) {
  try {
    const data = await adminClient.request(GET_RECENT_PRODUCTS, { limit })

    // Fetch seller information separately for each product
    const productsWithSellerInfo = await Promise.all(
      data.products.map(async (product: any) => {
        try {
          // Get user info for the seller
          const userResponse = await adminClient.request(GET_USER_BY_ID, { userId: product.seller_id })

          return {
            ...product,
            seller: userResponse.users_by_pk || { name: "Unknown Seller" },
          }
        } catch (error) {
          console.error("Error fetching seller info:", error)
          return {
            ...product,
            seller: { name: "Unknown Seller" },
          }
        }
      }),
    )

    return {
      success: true,
      recentProducts: productsWithSellerInfo,
    }
  } catch (error) {
    console.error("Error fetching recent products:", error)
    return {
      success: false,
      error: "Failed to fetch recent products",
    }
  }
}

// Helper function to format currency - Move to a utils file
export async function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
  }).format(amount)
}

// Helper function to format date - Move to a utils file
export async function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

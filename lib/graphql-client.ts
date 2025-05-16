import { GraphQLClient, gql } from "graphql-request"

// Re-export gql for use in other files
export { gql }

// Initialize the GraphQL client with Hasura endpoint using environment variables
const HASURA_ENDPOINT = process.env.NEXT_PUBLIC_HASURA_ENDPOINT || ""
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || ""

// Create a GraphQL client instance for admin requests (server-side only)
export const adminClient = new GraphQLClient(HASURA_ENDPOINT, {
  headers: {
    "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
  },
})

// Create a client for authenticated user requests
export const createAuthClient = (authToken: string) => {
  return new GraphQLClient(HASURA_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
}

// User queries and mutations
export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    users(where: {email: {_eq: $email}}) {
      id
      name
      email
      role
      password_hash
      created_at
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password_hash: String!, $role: String!) {
    insert_users_one(object: {
      name: $name, 
      email: $email, 
      password_hash: $password_hash, 
      role: $role
    }) {
      id
      name
      email
      role
    }
  }
`

// Seller profile queries and mutations
export const GET_SELLER_PROFILE = gql`
  query GetSellerProfile($userId: uuid!) {
    seller_profiles(where: {user_id: {_eq: $userId}}) {
      id
      business_name
      description
      is_approved
      created_at
    }
  }
`

export const CREATE_SELLER_PROFILE = gql`
  mutation CreateSellerProfile($userId: uuid!, $businessName: String!, $description: String) {
    insert_seller_profiles_one(object: {
      user_id: $userId,
      business_name: $businessName,
      description: $description,
      is_approved: false
    }) {
      id
      business_name
    }
  }
`

export const APPROVE_SELLER = gql`
  mutation ApproveSeller($profileId: uuid!) {
    update_seller_profiles_by_pk(pk_columns: {id: $profileId}, _set: {is_approved: true}) {
      id
      user_id
      business_name
      description
      is_approved
    }
  }
`

// Product queries and mutations
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      stock
      image_url
      seller_id
      created_at
    }
  }
`

export const GET_SELLER_PRODUCTS = gql`
  query GetSellerProducts($sellerId: uuid!) {
    products(where: {seller_id: {_eq: $sellerId}}) {
      id
      name
      description
      price
      stock
      image_url
      created_at
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: numeric!
    $stock: Int!
    $sellerId: uuid!
    $imageUrl: String
  ) {
    insert_products_one(
      object: {
        name: $name
        description: $description
        price: $price
        stock: $stock
        seller_id: $sellerId
        image_url: $imageUrl
      }
    ) {
      id
      name
      description
      price
      stock
      seller_id
      image_url
      created_at
    }
  }
`

// Add this query to your existing GraphQL client file
export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($productId: uuid!) {
    products_by_pk(id: $productId) {
      id
      name
      description
      price
      stock
      image_url
      created_at
      seller_id
    }
  }
`

// Subscription queries and mutations
export const GET_CUSTOMER_SUBSCRIPTIONS = gql`
  query GetCustomerSubscriptions($customerId: uuid!) {
    subscriptions(where: {customer_id: {_eq: $customerId}}) {
      id
      created_at
      seller_id
    }
  }
`

export const SUBSCRIBE_TO_SELLER = gql`
  mutation SubscribeToSeller($customerId: uuid!, $sellerId: uuid!) {
    insert_subscriptions_one(object: {
      customer_id: $customerId, 
      seller_id: $sellerId
    }) {
      id
      customer_id
      seller_id
      created_at
    }
  }
`

export const UNSUBSCRIBE_FROM_SELLER = gql`
  mutation UnsubscribeFromSeller($customerId: uuid!, $sellerId: uuid!) {
    delete_subscriptions(where: {
      customer_id: {_eq: $customerId}, 
      seller_id: {_eq: $sellerId}
    }) {
      affected_rows
    }
  }
`

// Admin queries
export const GET_PENDING_SELLERS = gql`
  query GetPendingSellers {
    seller_profiles(where: {is_approved: {_eq: false}}) {
      id
      business_name
      description
      created_at
      user {
        id
        name
        email
      }
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      created_at
    }
  }
`

// Add these admin dashboard queries to the end of the file

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    users_aggregate {
      aggregate {
        count
      }
    }
    seller_profiles_aggregate(where: {is_approved: {_eq: true}}) {
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

export const GET_RECENT_USERS = gql`
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

// Update the GET_RECENT_PRODUCTS query to not rely on the seller relationship
export const GET_RECENT_PRODUCTS = gql`
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

export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders($limit: Int!) {
    orders(order_by: {created_at: desc}, limit: $limit) {
      id
      total_amount
      status
      created_at
    }
  }
`

// Add these seller dashboard queries to the end of the file

// Update the GET_SELLER_DASHBOARD_STATS query to remove the customer field
export const GET_SELLER_DASHBOARD_STATS = gql`
  query GetSellerDashboardStats($sellerId: uuid!) {
    # Total sales
    orders_aggregate(where: {order_items: {product: {seller_id: {_eq: $sellerId}}}}) {
      aggregate {
        sum {
          total_amount
        }
      }
    }
    # Product count
    products_aggregate(where: {seller_id: {_eq: $sellerId}}) {
      aggregate {
        count
      }
    }
    # Subscriber count
    subscriptions_aggregate(where: {seller_id: {_eq: $sellerId}}) {
      aggregate {
        count
      }
    }
    # Recent orders - removing user_id field
    orders(
      where: {order_items: {product: {seller_id: {_eq: $sellerId}}}}
      order_by: {created_at: desc}
      limit: 5
    ) {
      id
      total_amount
      status
      created_at
      order_items_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

// Also update the GET_SELLER_ORDERS query to remove the customer field
export const GET_SELLER_ORDERS = gql`
  query GetSellerOrders($sellerId: uuid!) {
    orders(
      where: {order_items: {product: {seller_id: {_eq: $sellerId}}}}
      order_by: {created_at: desc}
    ) {
      id
      total_amount
      status
      created_at
      order_items {
        id
        quantity
        price_per_unit
        product {
          id
          name
          image_url
        }
      }
    }
  }
`

// Update the GET_SELLER_SUBSCRIBERS query to use customer_id instead of customer
export const GET_SELLER_SUBSCRIBERS = gql`
  query GetSellerSubscribers($sellerId: uuid!) {
    subscriptions(
      where: {seller_id: {_eq: $sellerId}}
      order_by: {created_at: desc}
    ) {
      id
      created_at
      customer_id
    }
  }
`

export const UPDATE_SELLER_PROFILE = gql`
  mutation UpdateSellerProfile($profileId: uuid!, $businessName: String!, $description: String) {
    update_seller_profiles_by_pk(
      pk_columns: {id: $profileId}, 
      _set: {
        business_name: $businessName, 
        description: $description
      }
    ) {
      id
      business_name
      description
    }
  }
`

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: uuid!, $name: String!, $email: String!) {
    update_users_by_pk(
      pk_columns: {id: $userId}, 
      _set: {
        name: $name, 
        email: $email
      }
    ) {
      id
      name
      email
    }
  }
`

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($userId: uuid!, $passwordHash: String!) {
    update_users_by_pk(
      pk_columns: {id: $userId}, 
      _set: {
        password_hash: $passwordHash
      }
    ) {
      id
    }
  }
`

export const GET_USER_BY_ID = gql`
  query GetUserById($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      name
      email
    }
  }
`

// Add a query to get user details by ID
export const GET_USER_DETAILS = gql`
  query GetUserDetails($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      name
      email
      created_at
    }
  }
`

// Customer dashboard queries
export const GET_CUSTOMER_DASHBOARD_STATS = gql`
  query GetCustomerDashboardStats($customerId: uuid!) {
    # Subscription count
    subscriptions_aggregate(where: {customer_id: {_eq: $customerId}}) {
      aggregate {
        count
      }
    }
    # Order count
    orders_aggregate(where: {customer_id: {_eq: $customerId}}) {
      aggregate {
        count
      }
    }
    # Recent subscriptions
    subscriptions(
      where: {customer_id: {_eq: $customerId}}
      order_by: {created_at: desc}
      limit: 3
    ) {
      id
      created_at
      seller_id
    }
  }
`

// Order queries and mutations
export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: uuid!) {
    orders(
      where: {customer_id: {_eq: $userId}}
      order_by: {created_at: desc}
    ) {
      id
      total_amount
      status
      created_at
      order_items {
        id
        quantity
        price_per_unit
        product {
          id
          name
          image_url
        }
      }
    }
  }
`

export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $userId: uuid!,
    $totalAmount: numeric!,
    $status: String!,
    $shippingAddress: String!,
    $orderItems: [order_items_insert_input!]!
  ) {
    insert_orders_one(
      object: {
        customer_id: $userId,
        total_amount: $totalAmount,
        status: $status,
        shipping_address: $shippingAddress,
        order_items: {
          data: $orderItems
        }
      }
    ) {
      id
    }
  }
`

// Marketplace queries - Updated to remove seller relationship
export const GET_MARKETPLACE_PRODUCTS = gql`
  query GetMarketplaceProducts($limit: Int!, $offset: Int!, $search: String) {
    products(
      where: {
        _or: [
          {name: {_ilike: $search}},
          {description: {_ilike: $search}}
        ]
      }
      limit: $limit
      offset: $offset
      order_by: {created_at: desc}
    ) {
      id
      name
      description
      price
      stock
      image_url
      created_at
      seller_id
    }
    products_aggregate(
      where: {
        _or: [
          {name: {_ilike: $search}},
          {description: {_ilike: $search}}
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`

// Check if user is subscribed to seller
export const CHECK_USER_SUBSCRIBED = gql`
  query CheckUserSubscribed($userId: uuid!, $sellerId: uuid!) {
    subscriptions(
      where: {
        customer_id: {_eq: $userId},
        seller_id: {_eq: $sellerId}
      }
    ) {
      id
    }
  }
`

export const GET_USER_CART = gql`
  query GetUserCart($userId: uuid!) {
    cart_items(where: {customer_id: {_eq: $userId}}) {
      id
      quantity
      product {
        id
        name
        price
        stock
        image_url
      }
    }
  }
`

export const ADD_TO_CART = gql`
  mutation AddToCart($userId: uuid!, $productId: uuid!, $quantity: Int!) {
    insert_cart_items_one(object: {customer_id: $userId, product_id: $productId, quantity: $quantity}) {
      id
    }
  }
`

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartItemId: uuid!, $quantity: Int!) {
    update_cart_items_by_pk(pk_columns: {id: $cartItemId}, _set: {quantity: $quantity}) {
      id
      quantity
    }
  }
`

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartItemId: uuid!) {
    delete_cart_items_by_pk(id: $cartItemId) {
      id
    }
  }
`

export const CLEAR_CART = gql`
  mutation ClearCart($userId: uuid!) {
    delete_cart_items(where: {customer_id: {_eq: $userId}}) {
      affected_rows
    }
  }
`

export const GET_USER_WISHLIST = gql`
  query GetUserWishlist($userId: uuid!) {
    wishlist_items(where: {customer_id: {_eq: $userId}}) {
      id
      product_id
      created_at
    }
  }
`

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($userId: uuid!, $productId: uuid!) {
    insert_wishlist_items_one(object: {customer_id: $userId, product_id: $productId}) {
      id
    }
  }
`

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($wishlistItemId: uuid!) {
    delete_wishlist_items_by_pk(id: $wishlistItemId) {
      id
    }
  }
`

// Add this query to your existing GraphQL client file
export const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: uuid!, $userId: uuid!) {
    orders(where: {id: {_eq: $orderId}, customer_id: {_eq: $userId}}) {
      id
      total_amount
      status
      shipping_address
      created_at
      order_items {
        id
        quantity
        price_per_unit
        product {
          id
          name
          image_url
        }
      }
    }
  }
`

# Hasura and PostgreSQL Setup for ShopTube

This document provides instructions for setting up Hasura GraphQL Engine with PostgreSQL for the ShopTube application.

## 1. Setting Up Hasura Cloud

1. Sign up for a Hasura Cloud account at https://cloud.hasura.io/
2. Create a new project
3. Connect to an existing PostgreSQL database or create a new one using Hasura's database provisioning

## 2. Database Schema

Create the following tables in your PostgreSQL database:

### Users Table
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
\`\`\`

### Seller Profiles Table
\`\`\`sql
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_is_approved ON seller_profiles(is_approved);
\`\`\`

### Products Table
\`\`\`sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
\`\`\`

### Orders Table
\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
\`\`\`

### Order Items Table
\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
\`\`\`

### Subscriptions Table
\`\`\`sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, seller_id)
);

CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_seller_id ON subscriptions(seller_id);
\`\`\`

### Wishlists Table
\`\`\`sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
\`\`\`

## 3. Setting Up Relationships in Hasura

After creating the tables, set up the following relationships in the Hasura console:

### Array Relationships
- users.seller_profile (to seller_profiles)
- users.products (to products where seller_id matches)
- users.orders (to orders where customer_id matches)
- users.subscriptions_as_customer (to subscriptions where customer_id matches)
- users.subscriptions_as_seller (to subscriptions where seller_id matches)
- users.wishlists (to wishlists where customer_id matches)
- orders.order_items (to order_items)

### Object Relationships
- seller_profiles.user (to users)
- products.seller (to users)
- orders.customer (to users)
- order_items.order (to orders)
- order_items.product (to products)
- subscriptions.customer (to users)
- subscriptions.seller (to users)
- wishlists.customer (to users)
- wishlists.product (to products)

## 4. Setting Up Permissions

Configure appropriate permissions for each role:

### Admin Role
- Full access to all tables

### Seller Role
- Read access to their own user data
- Read/Write access to their own seller profile
- Read/Write access to their own products
- Read access to orders containing their products
- Read access to their subscribers

### Customer Role
- Read access to their own user data
- Read access to all products
- Read/Write access to their own orders
- Read/Write access to their own subscriptions
- Read/Write access to their own wishlists

## 5. JWT Authentication

Configure JWT authentication in Hasura:

1. Generate a secure key for JWT signing
2. Configure the JWT settings in Hasura with the appropriate claims mapping
3. Set up the JWT provider in your Next.js application

## 6. Environment Variables

Add the following environment variables to your Next.js application:

\`\`\`
NEXT_PUBLIC_HASURA_ENDPOINT=https://your-hasura-instance.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
JWT_SECRET=your-jwt-secret
\`\`\`

## 7. Testing the Setup

Test your GraphQL API using the Hasura console to ensure all queries and mutations work as expected.

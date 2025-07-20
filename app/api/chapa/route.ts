import { NextRequest, NextResponse } from "next/server";
import { gql, GraphQLClient } from "graphql-request";

// Initialize the GraphQL client with Hasura endpoint using environment variables
const HASURA_ENDPOINT = process.env.NEXT_PUBLIC_HASURA_ENDPOINT || ""
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || ""

// Create a GraphQL client instance for admin requests (server-side only)
export const graphqlClient = new GraphQLClient(HASURA_ENDPOINT, {
  headers: {
    "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
  },
})

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $customerId: uuid!
    $totalAmount: numeric!
    $status: String!
    $shippingAddress: String!
    $orderItems: [order_items_insert_input!]!
    $txRef: String!
  ) {
    insert_orders_one(
      object: {
        customer_id: $customerId
        total_amount: $totalAmount
        status: $status
        shipping_address: $shippingAddress
        tx_ref: $txRef
        order_items: { data: $orderItems }
      }
    ) {
      id
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, email, phoneNumber, totalAmount, address, cartItems } = body;

    if (!userId || !totalAmount || !address || !Array.isArray(cartItems)) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    // Prepare order items for DB
    const orderItems = cartItems.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
    }));

    // Generate a unique tx_ref using timestamp (or use UUID or order ID after creation)
    const txRef = `shoptube-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 1. Create order with status 'payment_pending' and save tx_ref
    const variables = {
      customerId: userId,
      totalAmount,
      status: "payment_pending",
      shippingAddress: typeof address === "string" ? address : JSON.stringify(address),
      txRef,
      orderItems,
    };

    const createOrderResult = await graphqlClient.request(CREATE_ORDER, variables);
    const orderId = createOrderResult.insert_orders_one.id;

    // 2. Prepare Chapa payment initialization payload
    const payload = {
      amount: totalAmount,
      currency: "ETB",
      email,
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" ") || "-",
      phone_number: phoneNumber || "0910000000",
      tx_ref: txRef,
      callback_url: `https://final-project-hi-l-co-e-shop-tube.vercel.app/api/chapa/verify/${txRef}`,
      return_url: `https://final-project-hi-l-co-e-shop-tube.vercel.app/customer/order-confirmation?tx_ref=${txRef}`,
      customization: {
        title: "ShopTube Payment",
        description: "Pay for your order",
      },
      // no metadata needed now
    };

    const chapaResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await chapaResponse.json();

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        checkout_url: data.data.checkout_url,
        tx_ref: txRef,
        orderId,
      });
    } else {
      return NextResponse.json({ success: false, error: data.message || "Chapa init failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Chapa Init Error:", error);
    return NextResponse.json({ success: false, error: "Server error during Chapa init" }, { status: 500 });
  }
}

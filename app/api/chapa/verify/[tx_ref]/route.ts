import { NextResponse } from "next/server";
import { gql, GraphQLClient } from "graphql-request";

const graphqlClient = new GraphQLClient(process.env.HASURA_GRAPHQL_ENDPOINT!, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
  },
});

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $customerId: uuid!
    $totalAmount: numeric!
    $status: String!
    $shippingAddress: String!
    $orderItems: [order_items_insert_input!]!
  ) {
    insert_orders_one(
      object: {
        customer_id: $customerId
        total_amount: $totalAmount
        status: $status
        shipping_address: $shippingAddress
        order_items: { data: $orderItems }
      }
    ) {
      id
    }
  }
`;

interface CreateOrderResponse {
    insert_orders_one: {
      id: string;
    };
  }

export async function GET(
  request: Request,
  context: { params: Promise<{ tx_ref: string }> }
) {
  const { tx_ref } = await context.params;

  try {
    const chapaRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data, status } = await chapaRes.json();
    console.log("📋 Full Chapa response:", data); // Debug full response

    if (status !== "success" || data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed." },
        { status: 400 }
      );
    }

    const customerId = data.metadata?.user_id;
    const totalAmount = parseFloat(data.amount);
    const shippingAddress = data.metadata?.shipping_address;
    const orderItemsRaw = JSON.parse(data.metadata?.order_items_json || "[]");


    console.log("🔍 Raw metadata:", {
      customerId,
      totalAmount,
      shippingAddress,
      orderItemsRaw,
    });

    if (!customerId || !totalAmount || !shippingAddress || !Array.isArray(orderItemsRaw)) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid metadata." },
        { status: 400 }
      );
    }

    const orderItems = orderItemsRaw.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.price, // Changed to match database schema
    }));

    const variables = {
      customerId,
      totalAmount,
      status: "pending",
      shippingAddress,
      orderItems,
    };

    const result = await graphqlClient.request<CreateOrderResponse>(
      CREATE_ORDER,
      variables
    );

    console.log("✅ Order created:", result);

    return NextResponse.json({
      success: true,
      message: "Payment verified and order created.",
      orderId: result.insert_orders_one.id,
    });
  } catch (error: any) {
    console.error("❌ Verification or order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
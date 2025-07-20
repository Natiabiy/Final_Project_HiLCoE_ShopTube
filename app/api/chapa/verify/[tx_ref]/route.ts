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
    // 1. Verify payment with Chapa
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

    const chapaJson = await chapaRes.json();
    const { data, status } = chapaJson;

    console.log("📋 Full Chapa response:", data);

    if (status !== "success" || data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed." },
        { status: 400 }
      );
    }

    // 2. Extract metadata and parse order_items_json
    const customerId = data.metadata?.user_id;
    const totalAmount = parseFloat(data.amount);
    const shippingAddress = data.metadata?.shipping_address;
    let orderItemsRaw: any[] = [];

    try {
      orderItemsRaw = JSON.parse(data.metadata?.order_items_json || "[]");
    } catch (e) {
      console.error("❌ Failed to parse order_items_json:", e);
      return NextResponse.json(
        { success: false, message: "Invalid order_items_json format." },
        { status: 400 }
      );
    }

    console.log("🔍 Raw metadata:", {
      customerId,
      totalAmount,
      shippingAddress,
      orderItemsRaw,
    });

    // 3. Validate required metadata
    if (
      !customerId ||
      !totalAmount ||
      !shippingAddress ||
      !Array.isArray(orderItemsRaw) ||
      orderItemsRaw.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid metadata." },
        { status: 400 }
      );
    }

    // 4. Map order items to database schema
    const orderItems = orderItemsRaw.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.price,
    }));

    // 5. Create order in Hasura
    const variables = {
      customerId,
      totalAmount,
      status: "pending", // or "completed" depending on your workflow
      shippingAddress,
      orderItems,
    };

    const result = await graphqlClient.request<CreateOrderResponse>(
      CREATE_ORDER,
      variables
    );

    console.log("✅ Order created:", result);

    // 6. Return success response
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

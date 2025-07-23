import { NextResponse } from "next/server";
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
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($txRef: String!, $status: String!) {
    update_orders(
      where: { tx_ref: { _eq: $txRef } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;

export async function GET(
  request: Request,
  context: { params: Promise<{ tx_ref: string }> }
) {
  const { tx_ref } = await context.params;

  try {
    // 1. Verify payment with Chapa API
    const chapaRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const { data, status } = await chapaRes.json();

    if (status !== "success" || data.status !== "success") {
      // Mark order as failed or keep pending as you see fit
      await graphqlClient.request(UPDATE_ORDER_STATUS, { txRef: tx_ref, status: "failed" });

      return NextResponse.json({ success: false, message: "Payment verification failed." }, { status: 400 });
    }

    // 2. Payment successful — update order status to pending/completed
    await graphqlClient.request(UPDATE_ORDER_STATUS, { txRef: tx_ref, status: "pending" });

    return NextResponse.json({ success: true, message: "Payment verified and order updated." });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

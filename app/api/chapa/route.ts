import { NextRequest, NextResponse } from "next/server";

const CHAPA_API_URL = "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📋 Request body:", body); // Log the incoming request body

    const {
      userId,
      fullName,
      email,
      phoneNumber,
      totalAmount,
      address,
      cartItems,
    } = body;

    // Validate inputs
    if (!userId || !totalAmount || !address || !Array.isArray(cartItems)) {
      console.log("🔴 Validation failed:", { userId, totalAmount, address, cartItems });
      return NextResponse.json(
        { success: false, error: "Missing or invalid request data" },
        { status: 400 }
      );
    }

    const tx_ref = `shoptube-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const callback_url = `${BASE_URL}/api/chapa/verify/${tx_ref}`;

    const payload = {
      amount: totalAmount,
      currency: "ETB",
      email,
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" ") || "-",
      phone_number: phoneNumber || "0910000000",
      tx_ref,
      callback_url,
      return_url: `${BASE_URL}/customer/order-confirmation?tx_ref=${tx_ref}`,
      customization: {
        title: "ShopTube Payment",
        description: "Pay for your order",
      },
      metadata: {
        user_id: String(userId),
        shipping_address: typeof address === "string" ? address : JSON.stringify(address),
        order_items_json: JSON.stringify(
          cartItems.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price_per_unit,
          }))
        ),
      },
      
    };

    console.log("📋 Chapa request payload:", payload); // Log the payload sent to Chapa

    const chapaResponse = await fetch(CHAPA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await chapaResponse.json();
    console.log("📋 Chapa initialization response:", data); // Log Chapa’s response

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        checkout_url: data.data.checkout_url,
        tx_ref,
      });
    } else {
      console.log("🔴 Chapa initialization failed:", data);
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to initialize Chapa payment",
      });
    }
  } catch (error: any) {
    console.error("🔴 Chapa Init Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error during Chapa init" },
      { status: 500 }
    );
  }
}
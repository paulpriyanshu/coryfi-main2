import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    console.log("Received a request to create an order");

    // ✅ Parse request body
    const requestBody = await req.json();
    // console.log("Request Body:", requestBody);
    // console.log("cash free creds",process.env.CASHFREE_CLIENT_ID,process.env.CASHFREE_CLIENT_ID)

    const cashfreeBody = {
      order_id: requestBody.order_id || `order_${Date.now()}`,
      order_amount: requestBody.order_amount || 10.34,
      order_currency: "INR",
      customer_details: {
        customer_id: requestBody.customer_id || "test_user_001",
        customer_phone: requestBody.customer_phone,
        customer_email: requestBody.customer_email || "default@example.com",
        customer_name: requestBody.customer_name || "Test User"
      },
      order_meta: {
        return_url: requestBody.return_url || "https://example.com/return"
      }
    };

    // 🔐 Use sandbox keys (Move to .env for production)
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-api-version": "2025-01-01", // recommended stable version

        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cashfreeBody),
    });
   
    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree Error:", data);
      return NextResponse.json({ error: data || "Failed to create order" }, { status: response.status });
    }

    console.log("Cashfree API Success:", data);
    return NextResponse.json({ paymentSessionId: data.payment_session_id }, { status: 200 });

  } catch (error: any) {
    console.error("Error in Cashfree Order API:", error);
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { addMonths } from "date-fns";
import db from "@/db"

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;
const RETURN_URL = "https://connect.coryfi.com"; // ✅ Real return URL

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email, phone, amount, plan } = await req.json();

    // const order_id = `order_${userId}_${Date.now()}`;
    const order_id = `order_${userId}_${plan}_${Date.now()}`;
    const order_amount = amount || 10;
  

    // ✅ Create payment order in Cashfree
    const body = {
      order_id,
      order_amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_phone: phone,
        customer_email: email,
        customer_name: name,
      },
      order_meta: {
        return_url: RETURN_URL,
      },
    };

    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-api-version": "2025-01-01",
        "x-client-id": CASHFREE_CLIENT_ID,
        "x-client-secret": CASHFREE_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("single payment",data)
    if (!response.ok) {
      console.error("Cashfree Order Creation Error:", data);
      return NextResponse.json({ success: false, error: data.message || "Order creation failed" }, { status: response.status });
    }

    

    return NextResponse.json({
      success: true,
      paymentSessionId: data.payment_session_id,
      orderId: order_id,
    });

  } catch (error: any) {
    console.error("Unexpected Cashfree Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
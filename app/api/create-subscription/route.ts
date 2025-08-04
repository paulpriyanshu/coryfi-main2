import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;
const RETURN_URL = 'https://connect.coryfi.com';

export async function POST(req: NextRequest) {
  const { email, phone, name, userId } = await req.json();

  const subscriptionId = `sub_${userId}_${Date.now()}`;

  const now = new Date();
  const firstCharge = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000); // 2 days + 10 minutes from now
  const expiry = new Date('2100-01-01T23:00:08+05:30');

  const payload = {
    subscription_id: subscriptionId,
    customer_details: {
      customer_name: name,
      customer_email: email,
      customer_phone: phone
    },
    plan_details: {
      plan_name: 'Coryfi UPI Plan',
      plan_type: 'PERIODIC',
      plan_amount: 10,             // Monthly charge
      plan_max_amount: 100,        // Safety limit
      plan_max_cycles: 100,        // Up to 100 months
      plan_intervals: 1,           // Every 1 month
      plan_currency: 'INR',
      plan_interval_type: 'MONTH',
      plan_note: 'Monthly UPI AutoPay for Coryfi'
    },
    authorization_details: {
      authorization_amount: 10,              // Amount to block for UPI mandate
      authorization_amount_refund: true,     // Refund after blocking
      payment_methods: ['upi']               // ✅ Only UPI, no bank card
    },
    subscription_meta: {
      return_url: RETURN_URL,
      notification_channel: ['EMAIL']
    },
    subscription_expiry_time: expiry.toISOString(),
    subscription_first_charge_time: firstCharge.toISOString(),
    subscription_note: 'Coryfi AutoPay via UPI'
  };

  try {
    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/subscriptions',
      payload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2025-01-01', // ✅ Use supported version (check dashboard for latest if this fails)
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("auto pay data",response.data)
    return NextResponse.json({
      success: true,
      subscription_link: response.data.subscription_link
    });
  } catch (err: any) {
    console.error('Cashfree subscription error:', err.response?.data || err.message);
    return NextResponse.json({
      success: false,
      error: err.response?.data?.message || err.message
    }, { status: 500 });
  }
}
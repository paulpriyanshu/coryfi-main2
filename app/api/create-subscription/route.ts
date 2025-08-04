import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;
const RETURN_URL = 'https://connect.coryfi.com';

export async function POST(req: NextRequest) {
  const { email, phone, name, userId } = await req.json();
  const subscriptionId = `sub_${userId}_${Date.now()}`;

  const now = new Date();
  const firstCharge = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins later
  const expiry = new Date('2100-01-01T23:00:08+05:30');

  const payload = {
    subscription_id: subscriptionId,
    customer_details: {
      customer_name: name,
      customer_email: email,
      customer_phone: phone
      // ❌ No bank fields
    },
    plan_details: {
      plan_name: 'Coryfi UPI Plan',
      plan_type: 'PERIODIC',
      plan_amount: 10,
      plan_max_amount: 100,
      plan_max_cycles: 100,
      plan_intervals: 1,
      plan_currency: 'INR',
      plan_interval_type: 'MONTH',
      plan_note: 'Monthly UPI AutoPay for Coryfi'
    },
    authorization_details: {
      authorization_amount: 1,
      authorization_amount_refund: true,
      payment_methods: ['upi'] // ✅ Only UPI
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
    const res = await axios.post(
      'https://sandbox.cashfree.com/pg/subscriptions',
      payload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json({
      success: true,
      subscription_link: res.data.subscription_link
    });
  } catch (err: any) {
    console.error('Cashfree subscription error:', err.response?.data || err.message);
    return NextResponse.json({
      success: false,
      error: err.response?.data?.message || err.message
    }, { status: 500 });
  }
}
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2 } from "lucide-react";
import { addMonths } from "date-fns";
import db from "@/db"
let cashfree: any;

function Checkout({ userId, user_name, user_email, user_phone, total_amount, planType, planName }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log("inncoming data",userId,user_name,user_email,user_phone,total_amount,planName,planType)
    const selectedPlan = planType || "monthly"; // default to monthly
    const expiry = addMonths(new Date(), selectedPlan === "annual" ? 12 : 1);
  useEffect(() => {
    async function initSDK() {
      cashfree = await load({ mode: "production" });
      setLoaded(true);
    }
    initSDK();
  }, []);

  const doPayment = async (paymentSessionId: string) => {
    cashfree.checkout({ paymentSessionId, redirectTarget: "_self"});
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        amount: total_amount,
        userId,
        name: user_name,
        email: user_email,
        phone: user_phone,
        plan: planType,
      };

      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      await doPayment(data.paymentSessionId);
  
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-900 text-center">
      <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Click below to proceed to the checkout for <strong>{planName}</strong> plan.
      </p>

      <Button
        onClick={createOrder}
        disabled={!loaded || loading}
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </div>
        ) : (
          `Pay ₹${total_amount}`
        )}
      </Button>
    </div>
  );
}

export default Checkout;
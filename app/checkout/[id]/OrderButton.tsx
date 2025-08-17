"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { load } from "@cashfreepayments/cashfree-js";
import { generateOrderId } from "@/app/api/business/order/order";
import { deleteCart, moveCartToOrder } from "@/app/api/business/products";
import { fetchUserData } from "@/app/api/actions/media";
import { Loader2 } from "lucide-react"; // if you're using lucide-react icons
import { generateOTP } from "./otp";

let cashfree: any;

function Checkout({ userId, user_name, user_email, user_phone, total_amount, cart }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initSDK() {
      cashfree = await load({ mode: "production" });
      setLoaded(true);
    }
    initSDK();
  }, []);

  const doPayment = async (paymentSessionId: string) => {
    cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const order_id = await  generateOrderId();
      console.log("order_id",order_id)
      const cleanPhone = user_phone.replace(/\s+/g, "");

      const orderPayload = {
        order_id,
        order_amount: total_amount,
        customer_id: userId,
        customer_name: user_name,
        customer_email: user_email,
        customer_phone: cleanPhone,
        return_url: `https://connect.coryfi.com/orders/${userId}`,
      };

      const res = await fetch("/api/business/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      console.log("order created", order_id, data);

      const userData = await fetchUserData(parseInt(userId));
      
      const cartToOrder = await moveCartToOrder(
        cart.id,
        order_id,
        parseInt(userId),
        userData.userDetails.addresses,
        total_amount,
        
      );

      console.log("moved cart to order", cartToOrder);
      await deleteCart(cart.id)

      await doPayment(data.paymentSessionId);
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Click below to open the checkout page in current tab</p>
      <Button onClick={createOrder} disabled={!loaded || loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : (
          "Pay Now"
        )}
      </Button>
    </div>
  );
}

export default Checkout;
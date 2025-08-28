"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { load } from "@cashfreepayments/cashfree-js";
import { generateOrderId } from "@/app/api/business/order/order";
import { deleteCart, moveCartToOrder } from "@/app/api/business/products";
import { fetchUserData } from "@/app/api/actions/media";
import { Loader2 } from "lucide-react";

let cashfree: any;

function Checkout({ userId, user_name, user_email, user_phone, total_amount, cart, COD = false }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initSDK() {
      if (!COD) {
        cashfree = await load({ mode: "production" });
        setLoaded(true);
      }
    }
    initSDK();
  }, [COD]);

  const doPayment = async (paymentSessionId: string) => {
    cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const order_id = await generateOrderId();
      console.log("order_id", order_id);

      const userData = await fetchUserData(parseInt(userId));

      // ✅ If COD, skip payment gateway
      if (COD) {
        const cartToOrder = await moveCartToOrder(
          cart.id,
          order_id,
          parseInt(userId),
          userData.userDetails.addresses,
          total_amount,
          "COD"
        );
        console.log("COD Order created", cartToOrder);
        await deleteCart(cart.id)
        // Optionally delete cart after conversion
        // await deleteCart(cart.id);

        // Redirect to order details
        window.location.href = `/orders/${userId}`;
        return;
      }

      // ✅ Online Payment flow
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
      console.log("order created (online)", order_id, data);

      const cartToOrder = await moveCartToOrder(
        cart.id,
        order_id,
        parseInt(userId),
        userData.userDetails.addresses,
        total_amount,
        "pre-paid"
      );

      // await deleteCart(cart.id);

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
      <Button onClick={createOrder} disabled={(!loaded && !COD) || loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : COD ? "Place Order (COD)" : "Pay Now"}
      </Button>
    </div>
  );
}

export default Checkout;
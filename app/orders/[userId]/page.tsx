'use client';

import { useEffect, useState } from "react";
import Orderdetails from "./order-details";
import { getOrders } from "@/app/api/business/order/order";

export default function OrdersPage({ params }) {
  const userId = parseInt(params.userId);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    let intervalId

    const fetchOrders = async () => {
      try {
        const data = await getOrders(userId); // directly calls server fn
        setOrderData(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    if (userId) {
      fetchOrders(); // initial
      intervalId = setInterval(fetchOrders, 5000); // every 5s
    }

    return () => clearInterval(intervalId);
  }, [userId]);

  return (
    <>
      {userId ? <Orderdetails orderData={orderData} /> : null}
    </>
  );
}
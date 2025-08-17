import Orderdetails from "./order-details";
import { getOrders } from "@/app/api/business/order/order";

export default async function OrdersPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);
  const orderData = await getOrders(userId);
  // console.log("order data",JSON.stringify(orderData,null,2))

  return (
    <>
      {userId ? <Orderdetails orderData={orderData} /> : null}
    </>
  );
}
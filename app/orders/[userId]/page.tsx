import Orderdetails from "./order-details";
import { getOrders } from "@/app/api/business/order/order";

export default async function OrdersPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);
  const orderData = await getOrders(userId);

  return (
    <>
      {userId ? <Orderdetails orderData={orderData} /> : null}
    </>
  );
}
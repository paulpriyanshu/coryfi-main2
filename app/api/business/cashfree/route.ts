import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { Decimal } from "@prisma/client/runtime/library";
import {
  assignTaskToAllEmployees,
  getBusinessInfoFromOrder,
} from "../../actions/employees";
import { createPayoutForDay } from "../payouts";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Webhook Payload:", payload);

    if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({ message: "Ignored non-payment webhook" });
    }

    const {
      data: {
        order: { order_id, order_amount, order_currency },
        payment: {
          cf_payment_id,
          payment_status,
          payment_amount,
          payment_currency,
          payment_group,
          payment_time,
          bank_reference,
          payment_message,
        },
        customer_details: {
          customer_name,
          customer_email,
          customer_phone,
        },
      },
    } = payload;

    if (payment_status !== "SUCCESS") {
      console.log("Payment not successful");
      return NextResponse.json({ message: "Payment not successful" });
    }

    // Idempotency check
    const existingTx = await db.transaction.findUnique({
      where: { transactionId: String(cf_payment_id) },
    });

    if (existingTx) {
      console.log("Payment already processed, skipping.");
      return NextResponse.json({ message: "Already processed" });
    }

    const orderData = await db.order.findUnique({
      where: { order_id },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    if (!orderData) {
      console.warn("Order not found for ID:", order_id);
      return NextResponse.json({ message: "Order not found" });
    }

    // Assign tasks (optional)
    try {
      const businessInfo = await getBusinessInfoFromOrder(order_id);
      if (businessInfo.success && businessInfo.businessIds?.length) {
        const taskName = orderData.id || "New Task";

        await assignTaskToAllEmployees({
          businessIds: businessInfo.businessIds,
          orderId: order_id,
          taskName,
        });
      }
    } catch (taskErr) {
      console.warn("Task assignment failed:", taskErr);
    }

    const productQuantities: Record<number, number> = {};
    for (const item of orderData.orderItems) {
      productQuantities[item.productId] =
        (productQuantities[item.productId] || 0) + item.quantity;
    }

    const productIds = Object.keys(productQuantities).map(Number);

    await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      for (const product of products) {
        const available = product.stock ?? 0;
        const needed = productQuantities[product.id];
        if (available < needed) {
          throw new Error(`Insufficient stock for product ID ${product.id}`);
        }
      }

      for (const product of products) {
        const qty = productQuantities[product.id];
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: qty },
            Sales: { increment: qty },
          },
        });
      }

      await tx.order.update({
        where: { order_id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          orderId: order_id,
          transactionId: String(cf_payment_id),
          paymentStatus: payment_status,
          paymentAmount: payment_amount,
          paymentCurrency: payment_currency,
          paymentMode: payment_group ?? "unknown",
          paymentTime: new Date(payment_time),
          bankReference: bank_reference ?? null,
          paymentMessage: payment_message ?? null,
          customerName: customer_name,
          customerEmail: customer_email,
          customerPhone: customer_phone,
          paymentDetails: payload,
        },
      });

      // ✅ Proper payout split by business using product-level info
      const payoutDate = new Date(new Date(payment_time).toDateString());

      const businessPayouts: Record<string, Decimal> = {};

      for (const item of orderData.orderItems) {
        const businessId = item.product.businessPageId;
        const quantity = item.quantity;
        const price = item.details.price;
        const total = new Decimal(price).mul(quantity);

        if (!businessPayouts[businessId]) {
          businessPayouts[businessId] = total;
        } else {
          businessPayouts[businessId] = businessPayouts[businessId].add(total);
        }
      }

      for (const [businessPageId, amount] of Object.entries(businessPayouts)) {
        await createPayoutForDay({
          businessPageId,
          payoutForDate: payoutDate,
          payoutAmount: amount,
        });
      }
    });

    console.log("✅ Webhook processing complete.");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message || err);
    return NextResponse.json({ message: "Error handled internally" });
  }
}
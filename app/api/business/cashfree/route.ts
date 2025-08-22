import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { Decimal } from "@prisma/client/runtime/library";
import {
  assignTaskToAllEmployees,
  getBusinessInfoFromOrder,
} from "../../actions/employees";

import { notifyOwnersOnOrders } from "../../actions/media";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Webhook Payload:", payload);

    if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({ message: "Ignored non-payment webhook" });
    }

    const {
      data: {
        order: { order_id },
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
        customer_details: { customer_name, customer_email, customer_phone },
      },
    } = payload;

    if (payment_status !== "SUCCESS") {
      console.log("Payment not successful");
      return NextResponse.json({ message: "Payment not successful" });
    }

    // ✅ Handle premium subscription payments
    const premiumMatch = order_id.match(/^order_(\d+)_(monthly|annual)_\d+$/);
    if (premiumMatch) {
      const userId = parseInt(premiumMatch[1]);
      const selectedPlan = premiumMatch[2];

      // Idempotency check
      const existingTx = await db.transaction.findUnique({
        where: { transactionId: String(cf_payment_id) },
      });

      if (existingTx) {
        console.log("Payment already processed, skipping.");
        return NextResponse.json({ message: "Already processed" });
      }

      const existingPremium = await db.premiumSubscription.findFirst({
        where: { userId, expiry: { gte: new Date() } },
      });

      if (!existingPremium) {
        const expiry = new Date();
        if (selectedPlan === "annual") expiry.setFullYear(expiry.getFullYear() + 1);
        else expiry.setDate(expiry.getDate() + 30);

        await db.premiumSubscription.create({
          data: {
            userId,
            plan: selectedPlan,
            paidAmount: payment_amount,
            expiry,
          },
        });

        console.log(`✅ ${selectedPlan} premium subscription created for user:`, userId);
      } else {
        console.log("🔁 User already has active premium, skipping new entry.");
      }

      return NextResponse.json({ message: "Premium processed successfully" });
    }

    // ✅ Regular order flow
    const existingTx = await db.transaction.findUnique({
      where: { transactionId: String(cf_payment_id) },
    });

    if (existingTx) {
      console.log("Payment already processed, skipping.");
      return NextResponse.json({ message: "Already processed" });
    }

    const orderData = await db.order.findUnique({
      where: { order_id },
      include: { orderItems: { include: { product: true } } },
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
        // await assignTaskToAllEmployees({ businessIds: businessInfo.businessIds, orderId: order_id, taskName });
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
      // ✅ Stock checks
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      for (const product of products) {
        const available = product.stock ?? 0;
        const needed = productQuantities[product.id];
        if (available < needed) throw new Error(`Insufficient stock for product ID ${product.id}`);
      }

      // ✅ Decrement stock
      for (const product of products) {
        const qty = productQuantities[product.id];
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qty }, Sales: { increment: qty } },
        });
      }

      // ✅ Mark order as complete
      await tx.order.update({
        where: { order_id },
        data: { status: "completed", updatedAt: new Date() },
      });

      // ✅ Delete cart after completion
      try {
        await tx.cart.deleteMany({ where: { userId: orderData.userId } });
      } catch (cartError) {
        console.warn("⚠️ Cart deletion failed:", cartError);
      }

      // ✅ Save transaction
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

      // ✅ Handle payouts
      const payoutDate = new Date(new Date(payment_time).toDateString());
      const start = startOfDay(payoutDate);
      const end = endOfDay(payoutDate);

      const businessPayouts: Record<string, Decimal> = {};
      const businessProductGroups: Record<string, number[]> = {};

      for (const item of orderData.orderItems) {
        const businessId = item.product.businessPageId;
        const productId = item.product.id;
        const total = new Decimal(item.details.price).mul(item.quantity);

        businessPayouts[businessId] = (businessPayouts[businessId] || new Decimal(0)).add(total);

        if (!businessProductGroups[businessId]) businessProductGroups[businessId] = [];
        if (!businessProductGroups[businessId].includes(productId))
          businessProductGroups[businessId].push(productId);
      }

      for (const [businessPageId, amount] of Object.entries(businessPayouts)) {
        // ✅ Find or create payout
        let payout = await tx.payout.findFirst({
          where: { businessPageId, payoutForDate: { gte: start, lte: end } },
        });

        if (payout) {
          payout = await tx.payout.update({
            where: { id: payout.id },
            data: { payoutAmount: { increment: amount } },
          });
        } else {
          payout = await tx.payout.create({
            data: {
              businessPageId,
              payoutAmount: amount,
              payoutForDate: payoutDate,
              status: "PENDING",
            },
          });
        }

        // ✅ Attach payout to order items
        await tx.orderItem.updateMany({
          where: {
            orderId: orderData.id,
            product: { businessPageId },
          },
          data: { payoutId: payout.payout_id },
        });

        // ✅ Notifications
        try {
          await notifyOwnersOnOrders(businessProductGroups[businessPageId], businessPageId);
          console.log(`✅ Notification sent to business ${businessPageId}`);
        } catch (err) {
          console.warn(`⚠️ Failed to notify business ${businessPageId}:`, err);
        }
      }
    });

    console.log("✅ Webhook processing complete.");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message || err);
    return NextResponse.json({ message: "Error handled internally" });
  }
}
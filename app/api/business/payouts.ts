"use server"

import { Decimal } from "@prisma/client/runtime/library";
import db from "@/db"
import { startOfDay, endOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

export async function createOrUpdatePayoutForDay({
  businessPageId,
  payoutForDate,
  payoutAmount,
}: {
  businessPageId: string;
  payoutForDate: Date;
  payoutAmount: Decimal;
}) {
  const start = startOfDay(payoutForDate);
  const end = endOfDay(payoutForDate);

  // Find existing payout for that day
  const existing = await db.payout.findFirst({
    where: {
      businessPageId,
      payoutForDate: {
        gte: start,
        lte: end,
      },
    },
  });

  if (existing) {
    const updated = await db.payout.update({
      where: { id: existing.id },
      data: {
        payoutAmount: {
          increment: payoutAmount,
        },
      },
    });
    return updated;
  }

  // Create new payout
  return await db.payout.create({
    data: {
      businessPageId,
      payoutAmount,
      payoutForDate,
      status: "PENDING",
    },
  });
}

export async function updatePayoutAmount(id: number, amount: number) {
  return await db.payout.update({
    where: { id },
    data: {
      payoutAmount: new Decimal(amount),
    },
  });
}

export async function markPayoutAsPaid(payout_id: string, businessPageId: string, businessId: string) {
  const data = await db.payout.update({
    where: { payout_id },
    data: {
      status: 'PAID',
    },
  });
  revalidatePath(`/dashboard/${businessId}/${businessPageId}/payouts`)
  return data;
}

export async function getPayoutsForBusinessPage(businessPageId: string) {
  return await db.payout.findMany({
    where: { businessPageId },
    orderBy: {
      payoutForDate: 'desc',
    },
  });
}
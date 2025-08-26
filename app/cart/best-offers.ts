import db from "@/db"

async function applyBestOfferForBusiness(
  orderTotal: number,
  businessPageId: string,
  items: { productId: number; price: number }[]
) {
  const offers = await db.offer.findMany({
    where: {
      businessPageId,
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  })

  let bestDiscount = 0
  let appliedOffer: typeof offers[number] | null = null

  for (const offer of offers) {
    if (orderTotal >= (offer.minOrderAmount ?? 0)) {
      let discount = 0
      if (offer.discountType === "PERCENTAGE") {
        discount = (orderTotal * offer.discountValue) / 100
      } else if (offer.discountType === "FLAT") {
        discount = offer.discountValue
      }

      if (discount > bestDiscount) {
        bestDiscount = discount
        appliedOffer = offer
      }
    }
  }

  // 🔽 distribute discount proportionally across products
  let discountedProducts = items.map(item => {
    if (bestDiscount > 0 && orderTotal > 0) {
      const share = (item.price / orderTotal) * bestDiscount
      return {
        productId: item.productId,
        originalPrice: item.price,
        discountedPrice: item.price - share,
      }
    }
    return {
      productId: item.productId,
      originalPrice: item.price,
      discountedPrice: item.price,
    }
  })

  return {
    appliedOffer,
    bestDiscount,
    finalTotal: orderTotal - bestDiscount,
    products: discountedProducts, // ✅ per-product discounted prices
  }
}

async function applyBestOffer(orderItems: { productId: number; price: number }[]) {
  // 1. Get businessPageId for all products
  const products = await db.product.findMany({
    where: { id: { in: orderItems.map(i => i.productId) } },
    select: { id: true, businessPageId: true },
  })

  // 2. Group items by businessPageId
  const itemsByBusiness: Record<string, { total: number; items: { productId: number; price: number }[] }> = {}
  for (const item of orderItems) {
    const product = products.find(p => p.id === item.productId)
    if (!product) continue
    const businessId = product.businessPageId
    if (!itemsByBusiness[businessId]) {
      itemsByBusiness[businessId] = { total: 0, items: [] }
    }
    itemsByBusiness[businessId].total += item.price
    itemsByBusiness[businessId].items.push(item)
  }

  // 3. Apply offers per business
  const results: Record<string, any> = {}
  for (const [businessId, data] of Object.entries(itemsByBusiness)) {
    results[businessId] = await applyBestOfferForBusiness(
      data.total,
      businessId,
      data.items
    )
  }

  return results
}

export { applyBestOffer }
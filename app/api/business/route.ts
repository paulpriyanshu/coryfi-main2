import { NextResponse } from "next/server";
import db from "@/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessPageId = searchParams.get("businessPageId");

    if (!businessPageId) {
      return NextResponse.json(
        { error: "businessPageId is required" },
        { status: 400 }
      );
    }

    const data = await db.product.findMany({
      where: { businessPageId },
      include: {
        variants: {
          include: { productB: true },
        },
        variantOf: {
          include: { productA: true },
        },
        category: true,
        offers: true,
        categoryCarousel: true,
      },
    });

    // Process the data to organize variants by type
    const processedData = data.map((product) => {
      const allVariants: Record<string, any[]> = {};

      // Process variants (where product is productA)
      product.variants.forEach((variant) => {
        if (!allVariants[variant.relationType]) {
          allVariants[variant.relationType] = [];
        }
        allVariants[variant.relationType].push({
          product: variant.productB,
          description: variant.description,
          relationId: variant.id,
        });
      });

      // Process variantOf (where product is productB)
      product.variantOf.forEach((variant) => {
        if (!allVariants[variant.relationType]) {
          allVariants[variant.relationType] = [];
        }
        allVariants[variant.relationType].push({
          product: variant.productA,
          description: variant.description,
          relationId: variant.id,
        });
      });

      return {
        ...product,
        variantsByType: allVariants,
        variants: undefined,
        variantOf: undefined,
      };
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
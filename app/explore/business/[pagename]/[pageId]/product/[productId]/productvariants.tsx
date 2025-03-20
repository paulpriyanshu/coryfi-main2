"use client"; // Ensure it's a client component

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const ProductVariants = ({ product }) => {
  const pathname = usePathname();
  const [selectedVariant, setSelectedVariant] = useState(null);

  return (
    <div>
      <h3 className="mb-2 font-medium">Variants</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {product?.variants?.map((variant, index) => {
          // Get current URL segments and replace the last one with the variant ID
          const segments = pathname.split("/");
          segments[segments.length - 1] = variant.variantProduct.id;
          const newUrl = segments.join("/");

          return (
            <Link
              key={index}
              href={newUrl}
              onClick={() => setSelectedVariant(index)}
              className={`cursor-pointer rounded-md border p-2 transition-all hover:border-primary ${
                index === selectedVariant ? "border-primary ring-1 ring-primary" : "border-muted"
              } ${variant.variantProduct.stock <= 0 ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image
                    src={variant.variantProduct.images[0] || "/placeholder.svg"}
                    alt={variant.variantProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{variant.variantProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{variant.color}</p>
                  {variant.variantProduct.stock <= 0 && (
                    <p className="text-xs font-medium text-destructive">Out of stock</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariants;
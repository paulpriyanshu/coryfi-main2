"use server"
import { generateOTP } from "@/app/checkout/[id]/otp";
import db from "@/db"
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createOrUpdatePayoutForDay } from "./payouts";


export const getProductDetails = async (pageId: string, productId: number) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
      businessPageId: pageId
    },
    include: {
      business: true,
      category: true,
      categoryCarousel: true,
      offers: true,
      fields:true,
      counter:true,
      variants: {
        select: {
          description: true,
          relationType: true,
          productB: {
            select: {
              id: true,
              name: true,
              SKU: true,
              basePrice: true,
              BeforeDiscountPrice: true,
              stock: true,
              images: true
            }
          }
        }
      },
      variantOf: {
        select: {
          description: true,
          relationType: true,
          productA: {
            select: {
              id: true,
              name: true,
              SKU: true,
              basePrice: true,
              BeforeDiscountPrice: true,
              stock: true,
              images: true
            }
          }
        }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Process variants into an array format with relation type
  const variants = [
    ...product.variants.map(variant => ({
      relationType: variant.relationType,
      description: variant.description,
      product: variant.productB
    })),
    ...product.variantOf.map(variant => ({
      relationType: variant.relationType,
      description: variant.description,
      product: variant.productA
    }))
  ];

  return {
    ...product,
    variants, // Replacing the original variant structure
    variantOf: undefined // Removing original array for cleanup
  };
};
export const getFiltersByProduct = async (productId: number) => {
  try {
    return await db.field.findMany({
      where: { productId },
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw new Error("Failed to fetch filters");
  }
};

export const addFilter = async (
  productId: number,
  name: string, // Field name (e.g., "Toppings")
  keyValues: Record<string, number | string>, // Multiple keys with values
  showCost:boolean,
  type: string // Type (e.g., "Cost", "Length")
) => {
  try {
    // console.log("fields data", productId, name, keyValues, type);

    // Check if the product exists before adding the filter
    const productExists = await db.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    // Create the filter entry
    const data = await db.field.create({
      data: {
        name,
        keyValues, // Store as JSON
        type,
        showCost,
        productId,
      },
    });

    return data; // Return the created entry
  } catch (error) {
    console.error("Error adding filter:", error);
    throw new Error("Failed to add filter");
  }
};

export const editFilter = async (
  filterId: number,
  name?: string,
  keyValues?: Record<string, number | string>, 
  showCost?:any,
  type?: string
) => {
  try {
    const filterExists = await db.field.findUnique({
      where: { id: filterId },
    });

    if (!filterExists) {
      throw new Error("Filter not found");
    }
    const updatedFilter = await db.field.update({
      where: { id: filterId },
      data: {
        name: name ?? filterExists.name,
        showCost,
        keyValues: keyValues ?? filterExists.keyValues,
        type: type ?? filterExists.type,
      },
    });

    return updatedFilter;
  } catch (error) {
    console.error("Error editing filter:", error);
    throw new Error("Failed to edit filter");
  }
};

export const deleteFilter = async (filterId: number) => {
  try {
    const filterExists = await db.field.findUnique({
      where: { id: filterId },
    });

    if (!filterExists) {
      throw new Error("Filter not found");
    }
    await db.field.delete({
      where: { id: filterId },
    });

    return { message: "Filter deleted successfully" };
  } catch (error) {
    console.error("Error deleting filter:", error);
    throw new Error("Failed to delete filter");
  }
};




export const addCounter = async (
  productId: number,
  name: string, // Example: "Breads"
  keyValues: Record<string, number | string>, // Example: { "Bread": 2 }
  type: string, // Example: "Quantity"
  description?: string // Optional description
) => {
  try {
    // console.log(Object.keys(db));
    // console.log("Adding counter:", productId, name, keyValues, type, description);

    // Check if the product exists before adding the counter
    const productExists = await db.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    // Create the counter entry
    const data = await db.counter.create({
      data: {
        name,
        keyValues, // Store as JSON
        type,
        description,
        productId,
      },
    });

    return data; // Return the created counter entry
  } catch (error) {
    console.error("Error adding counter:", error);
    throw new Error("Failed to add counter");
  }
};

export const editCounter = async (
  counterId: number,
  name?: string,
  keyValues?: Record<string, number | string>, 
  type?: string,
  description?: string
) => {
  try {
    // console.log("Editing counter:", counterId, name, keyValues, type, description);

    const counterExists = await db.counter.findUnique({
      where: { id: counterId },
    });

    if (!counterExists) {
      throw new Error("Counter not found");
    }

    // Update the counter entry
    const updatedCounter = await db.counter.update({
      where: { id: counterId },
      data: {
        name: name ?? counterExists.name,
        keyValues: keyValues ?? counterExists.keyValues,
        type: type ?? counterExists.type,
        description: description ?? counterExists.description,
      },
    });

    return updatedCounter;
  } catch (error) {
    console.error("Error editing counter:", error);
    throw new Error("Failed to edit counter");
  }
};

export const deleteCounter = async (counterId: number) => {
  try {
    // console.log("Deleting counter:", counterId);

    const counterExists = await db.counter.findUnique({
      where: { id: counterId },
    });

    if (!counterExists) {
      throw new Error("Counter not found");
    }

    await db.counter.delete({
      where: { id: counterId },
    });

    return { message: "Counter deleted successfully" };
  } catch (error) {
    console.error("Error deleting counter:", error);
    throw new Error("Failed to delete counter");
  }
};
export const addProduct = async ({
  businessPageId,
  name,
  description,
  categoryId,
  images,
  stock,
  basePrice,
  BeforeDiscountPrice,
  SKU,
  receiveBy, // ✅ Correct spelling
  deliveryCharge,
  takeawayCharge,
  dineinCharge,
}: {
  businessPageId?: string;
  name: string;
  description?: string;
  categoryId?: number;
  images: string[];
  stock?: number;
  basePrice?: number;
  BeforeDiscountPrice?: number;
  SKU?: string;
  receiveBy?: string[];
  deliveryCharge?: number;
  takeawayCharge?: number;
  dineinCharge?: number;
}) => {
  try {
    const data = await db.product.create({
      data: {
        businessPageId,
        name,
        description,
        categoryId,
        images,
        stock,
        basePrice,
        BeforeDiscountPrice,
        SKU,
        recieveBy: receiveBy?.length ? receiveBy : ["DELIVERY"],
        deliveryCharge,
        takeawayCharge,
        dineinCharge,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Something went wrong" };
  }
};
export const editProduct = async (
  productId: number,
  updates: Partial<{
    businessPageId: string;
    name: string;
    description: string;
    categoryId: number;
    images: string[];
    stock: number;
    basePrice: number;
    BeforeDiscountPrice: number;
    SKU: string;
    recieveBy: string[]; // still using same spelling as DB
    deliveryCharge: number;
    takeawayCharge: number;
    dineinCharge: number;
  }>
) => {
  try {
    const data = await db.product.update({
      where: { id: productId },
      data: updates,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Something went wrong" };
  }
};

export const  deleteProduct=async(productId)=>{

  try {
    await db.product.delete({
      where:{
        id:productId
      }
    })
    return

  } catch (error) {
    console.error('Error deleting product',error)
    
  }

}

export const getAllProducts = async (businessPageId: string) => {
  try {
    if (!businessPageId) throw new Error("businessPageId is required");

    const data = await db.product.findMany({
      where: {
        businessPageId,
      },
      include: {
        // Include both sides of the variant relationship
        variants: {
          include: {

            productB: true
          },
         
        },
        variantOf: {
          include: {
            productA: true
          },
        },
        // Keep any other relations you need
        category: true,
        offers: true,
        categoryCarousel: true
      },
    });

    // Process the data to organize variants by type
    const processedData = data.map(product => {
      // Combine variants from both sides of the relationship
      const allVariants = {};

      // Process variants (where product is productA)
      product.variants.forEach(variant => {
        if (!allVariants[variant.relationType]) {
          allVariants[variant.relationType] = [];
        }
        allVariants[variant.relationType].push({
          product: variant.productB,
          description: variant.description,
          relationId:variant.id
        });
      });

      // Process variantOf (where product is productB)
      product.variantOf.forEach(variant => {
        if (!allVariants[variant.relationType]) {
          allVariants[variant.relationType] = [];
        }
        allVariants[variant.relationType].push({
          product: variant.productA,
          description: variant.description,
          relationId:variant.id
        });
      });

      // Return the product with organized variants
      return {
        ...product,
        variantsByType: allVariants,
        // Optionally remove the original arrays if you don't need them
        variants: undefined,
        variantOf: undefined
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};



export const getCategories = async (pageId:string) => {
  try {
    const data = await db.category.findMany({
      where: { businessPageId: pageId, parentCategoryId: null }, // Fetch only root categories
      include: {
        subcategories: {
          include: {
            subcategories: {
              include: {
                subcategories: true, // Fetch three levels deep
              },
            },
          },
        },
        categoryCarousel: true,
        products: {
          select: { id: true, name: true },
        },
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Something went wrong" };
  }
};


export const addCategory = async ({
  name,
  parentCategoryId,
  images,
  categoryCarouselId,
  businessPageId,
  products = [], // Accept an array of existing product IDs
}) => {
  try {
    const data = await db.category.create({
      data: {
        name,
        businessPageId,
        parentCategoryId,
        images,
        categoryCarouselId,
        products: {
          connect: products.map((id) => ({ id:Number(id) })), // Connect existing products
        },
      },
      include: { products: true }, // Include products in response
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Something went wrong" };
  }
};




export const addVariant = async (
  productIdA: number,
  productIdB: number,
  relationType: string,
  description?: string
) => {
  try {
    // Check if this specific relationship already exists
    const existingRelation = await db.productVariant.findFirst({
      where: {
        OR: [
          { productAId: productIdA, productBId: productIdB, relationType },
          { productAId: productIdB, productBId: productIdA, relationType }
        ]
      }
    });

    if (existingRelation) {
      return { success: false, message: "Relationship already exists", relation: existingRelation };
    }

    // Create a new relationship
    const newRelation = await db.productVariant.create({
      data: {
        productAId: productIdA,
        productBId: productIdB,
        relationType,
        description
      }
    });

    return { success: true, message: "Relationship created successfully", relation: newRelation };
  } catch (error) {
    console.error("Error adding variant:", error);
    return { success: false, message: "An error occurred while adding the variant" };
  }
};
export const autoRevalidateProducts = async (businessId: string, pageId: string) => {
  // console.log("Revalidating products...");
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 3 seconds
  revalidatePath(`/dashboard/${businessId}/${pageId}/products`);
};
export const editProductVariant = async (
  relationId: number,
  productIdA: number,
  productIdB: number,
  newRelationType: string,
  description: string,
  businessId: string,
  pageId: string
) => {
  // console.log("Updating variant relation:", productIdA, productIdB, newRelationType,relationId);

  // Start a transaction to safely update the relationship
  const updatedVariant = await db.$transaction(async (tx) => {
    // Fetch the existing relation
    const existingVariant = await tx.productVariant.findUnique({
      where: { id: relationId },
      include: { productA: true, productB: true }
    });

    if (!existingVariant) {
      throw new Error("Variant relation not found");
    }

    // Update the existing relation instead of replacing it
    return await tx.productVariant.update({
      where: { id: relationId },
      data: {
        relationType: newRelationType,
        description
      }
    });
  });

  // console.log("Revalidating path:", `/dashboard/${businessId}/${pageId}/products`);
  revalidatePath(`/dashboard/${businessId}/${pageId}/products`);

  return updatedVariant;
};

export const deleteProductVariant=async(
  productIdA: number,
  productIdB: number,
  relationType?: string,
  businessId?:string,
  pageId?:string,
 
 
)=>{
  const whereClause = {
    OR: [
      { 
        productAId: productIdA, 
        productBId: productIdB,
        ...(relationType ? { relationType } : {})
      },
      { 
        productAId: productIdB, 
        productBId: productIdA,
        ...(relationType ? { relationType } : {})
      }
    ]
  };
  
  // Find the relationships to delete
  const variantsToDelete = await db.productVariant.findMany({
    where: whereClause
  });
  
  if (variantsToDelete.length === 0) {
    throw new Error('Variant relationship not found');
  }
  
  // Delete the relationship(s)
  const result = await db.productVariant.deleteMany({
    where: whereClause
  });
  // console.log("Revalidating path:", `/dashboard/${businessId}/${pageId}/products`);
  revalidatePath(`/dashboard/${businessId}/${pageId}/products`)
  return {
    deletedCount: result.count,
    message: `Deleted ${result.count} variant relationship(s)`
  };
}

export async function updateCategory(
  id: number,
  name: string,
  parentCategoryId: number | null,
  images: string[],
  subcategories:{id:number}[],
  categoryCarouselId: number | null,
  products: { id: number }[],
) {
  // console.log("products",products)
  const data = await db.category.update({
    where: { id },
    data: {
      name,
      parentCategoryId,
      images,
      categoryCarouselId,
      subcategories: {
        set: subcategories.map((category) => ({id:category.id})), // Map product objects to just their IDs
      },
      products: {
        set: products.map((product) => ({ id: product.id })), // Map product objects to just their IDs
      },

    },
    include: { products: true },
  })

  return data
}

export const deleteCategory = async (categoryId: number) => {
  try {
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: { products: true, subcategories: true }, // Include related entities
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    // Optional: Unlink all associated products before deletion
    await db.category.update({
      where: { id: categoryId },
      data: {
        products: { set: [] }, // Disconnect all linked products
        subcategories: { set: [] }, // Unlink any child categories if applicable
      },
    });

    // Delete the category
    await db.category.delete({
      where: { id: categoryId },
    });

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Something went wrong" };
  }
};

export const addToCategoryCarousel = async (
  categoryId?: number,
  businessPageId?: string
) => {
  try {
    // console.log("Adding to category carousel...");

    if (!businessPageId) {
      throw new Error("Business Page ID is required.");
    }

    const data = await db.categoryCarousel.upsert({
      where: { businessPageId }, // Check if it exists
      update: {
        categories: categoryId
          ? { connect: [{ id: categoryId }] } // Update categories
          : undefined,
      },
      create: {
        businessPageId,
        categories: categoryId
          ? { connect: [{ id: categoryId }] } // Create new entry
          : undefined,
      },
    });

    // console.log("Category carousel updated:", data);
    return data;
  } catch (error) {
    console.error("Error updating category carousel:", error);
    throw new Error("Failed to update category carousel.");
  }
};
export const getCategoryCarousel = async(businessPageId)=>{
  try {
      const data=await db.categoryCarousel.findUnique({
        where:{
          businessPageId
        },
        include:{
          categories:true,
          products:true,
        }
      })
      // console.log("this page id ",businessPageId)
      // console.log("added categories",data)
      return data
  } catch (error) {
    console.error("Error adding to category carousel:", error);
    throw new Error("Failed to update category carousel.");
    
  }

}

// export const deleteCategoryFromCategoryCarousel=async(categoryId,businessPageId)=>{
//   try {
//     const data=await db.categoryCarousel.delete({
//       where
//     })
    
//   } catch (error) {
    
//   }
// }
// import { dbClient } from '@db/client';

// const db = new dbClient();

export const deleteCategoryFromBusinessPage=async(businessPageId: string, categoryId: number)=>{
    try {
        // Fetch the existing categories
        const categoryCarousel = await db.categoryCarousel.findUnique({
            where: { businessPageId },
            include: { categories: true }
        });

        if (!categoryCarousel) {
            throw new Error('Business Page not found');
        }

        // Filter out the category to be removed
        const updatedCategories = categoryCarousel.categories.filter(category => category.id !== categoryId);

        // Update the database
        await db.categoryCarousel.update({
            where: { businessPageId },
            data: { categories: { set: updatedCategories.map(cat => ({ id: cat.id })) } }
        });

        // console.log(`Category ${categoryId} removed successfully.`);
    } catch (error) {
        console.error('Error removing category:', error);
    }
}









export async function addToCart(userId, newCartItems: any[], address?: string) {
  const userIdNumber = userId;
  // console.log("user id ", typeof userIdNumber);
  // console.log("adding cart items ", newCartItems);

  if (isNaN(userIdNumber)) {
    throw new Error("Invalid userId. Expected a number.");
  }

  // console.log("User ID:", userIdNumber); // Debugging

  // Find existing cart
  let existingCart = await db.cart.findUnique({
    where: { userId: userIdNumber }, // Ensure correct type
  });

  // console.log("existing cart", existingCart);

  if (existingCart) {
    const updatedCartItems = [...(existingCart.cartItems ?? []), ...newCartItems];

    const uniqueProductIds = Array.from(
      new Set(updatedCartItems.map((item) => item.productId))
    );

    await db.cart.update({
      where: { id: existingCart.id },
      data: {
        cartItems: updatedCartItems,
        productIds: [...existingCart.productIds, ...newCartItems.map((item) => item.productId)],
        totalCost: existingCart.totalCost + newCartItems.reduce((sum, item) => sum + item.price, 0),
      },
    });
  } else {
    // If no cart is found, create a new one
    if (newCartItems.length === 0) {
      throw new Error("Cannot create an empty cart");
    }

    const totalCost = newCartItems.reduce((sum, item) => sum + item.price, 0);

    await db.cart.create({
      data: {
        userId: userIdNumber, // Ensure correct type
        productIds: newCartItems.map(item => item.productId),
        cartItems: newCartItems,
        totalCost,
        address: address || null,
      },
    });
  }

  // ✅ Always revalidate cart page after updating or creating
  revalidatePath("/cart");
}


export async function getCartsByUserId(userId: number) {
  // Fetch the cart for the user
  const cart = await db.cart.findUnique({
    where: { userId },
  });

  // console.log("Cart items:", cart);

  // If cart doesn't exist or is empty, return null
  if (!cart || !cart.productIds.length) return null;

  // Fetch product details for all product IDs in the cart
  const products = await db.product.findMany({
    where: { id: { in: cart.productIds } },
    select: {
      id: true,
      name: true,
      basePrice: true,
      images: true,
      stock: true,
    },
  });

  // console.log("Product details:", products);

  // Ensure cartItems is an array (fallback to empty array if undefined)
  const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

  // Merge cart items with product details while keeping duplicates
  const cartItemsWithDetails = cartItems
    .map((cartItem: any) => {
      const product = products.find((p) => p.id === cartItem.productId);

      if (!product) {
        console.warn(`Product with ID ${cartItem.productId} not found`);
        return null; // Skip if product is not found
      }

      return {
        ...cartItem, // Keep cart item properties (quantity, customization, etc.)
        ...product, // Merge product details (name, images, basePrice, stock, etc.)
      };
    })
    .filter(Boolean); // Remove any null values

  return {
    ...cart,
    cartItems: cartItemsWithDetails, // Return cartItems with product details
  };
}

export async function deleteCart(cartId: string) {
  await db.cart.delete({
    where: { id: cartId },
  });
}




export async function moveCartToOrder(
  cartId: string,
  order_id: string,
  userId: number,
  address: any,
  totalCost: any
) {
  const cart = await db.cart.findUnique({ where: { id: cartId } });
  if (!cart) throw new Error("Cart not found");

  const parsedCartItems = cart.cartItems ?? [];
  const productIds = parsedCartItems.map((item: any) => item.productId);

  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, businessPageId: true },
  });

  const productToBusinessMap = new Map<number, string>();
  products.forEach((p) => productToBusinessMap.set(p.id, p.businessPageId));

  // OTP grouped by (businessPageId + recieveBy)
  const otpMap = new Map<string, string>();
  for (const item of parsedCartItems) {
    const businessId = productToBusinessMap.get(item.productId);
    const recieveBy = item.recieveBy?.type.toUpperCase?.() || "UNKNOWN";
    const otpKey = `${businessId}_${recieveBy}`;
    if (!otpMap.has(otpKey)) otpMap.set(otpKey, String(generateOTP(6)));
  }

  const orderItemsData: any[] = [];
  for (const item of parsedCartItems) {
    const businessId = productToBusinessMap.get(item.productId)!;
    const recieveBy = item.recieveBy?.type.toUpperCase?.() || "UNKNOWN";
    const otpKey = `${businessId}_${recieveBy}`;
    const otp = otpMap.get(otpKey);

    let customizations: string[] = [];
    if (item.fields) {
      for (const [, field] of Object.entries(item.fields)) {
        const f = field as any;
        if (f?.key) customizations.push(f.key);
      }
    }
    if (item.counterItems) {
      for (const [key, ci] of Object.entries(item.counterItems)) {
        const c = ci as any;
        if (c?.count && c.count > 0) {
          customizations.push(`${key}: ${c.count}`);
        }
      }
    }

    const customization = customizations.join(", ") || null;

    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity || 1,
      details: item || null,
      customization,
      recieveBy: item.recieveBy || null,
      OTP: otp,
      // payoutId: will be connected later after payment
    });
  }

  const order = await db.order.create({
    data: {
      order_id,
      userId,
      totalCost,
      address: address ?? "No address provided",
      status: "pending",
      orderItems: { create: orderItemsData },
    },
  });

  return order;
}
export async function updateCart(cartId: string, cartItems: any[], address?: string) {
  // console.log("updating",cartItems)
  const totalCost = cartItems.reduce((sum, item) => sum + item.price, 0);

  const updatedCart = await db.cart.update({
    where: { id: cartId },
    data: {
      productIds: cartItems.map(item => item.id),
      cartItems,
      totalCost,
      address: address || undefined,
    },
  });

  return updatedCart;
}
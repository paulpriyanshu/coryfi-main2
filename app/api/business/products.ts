"use server"
import db from "@/db"
import { tree } from "d3";
import { revalidatePath } from "next/cache";

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
    return await db.fields.findMany({
      where: { productId },
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw new Error("Failed to fetch filters");
  }
};

export const addFilter = async (productId: number, key: string, values: string[]) => {
  try {
    console.log("fields data", productId, key, values);

    // Check if the product exists before adding the filter
    const productExists = await db.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    // Create the filter entry
    const data = await db.fields.create({
      data: {
        key,
        value: values, // Store as an array
        productId,
      },
    });

    return data; // Return the created entry
  } catch (error) {
    console.error("Error adding filter:", error);
    throw new Error("Failed to add filter");
  }
};

export const editFilter = async (filterId: number, key?: string, values?: string[]) => {
  try {
    // Find the filter before updating
    const filterExists = await db.fields.findUnique({
      where: { id: filterId },
    });

    if (!filterExists) {
      throw new Error("Filter not found");
    }

    // Update the filter
    const updatedFilter = await db.fields.update({
      where: { id: filterId },
      data: {
        key: key ?? filterExists.key, // Keep existing key if not provided
        value: values ?? filterExists.value, // Keep existing values if not provided
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
    // Check if filter exists before deleting
    const filterExists = await db.fields.findUnique({
      where: { id: filterId },
    });

    if (!filterExists) {
      throw new Error("Filter not found");
    }

    // Delete the filter
    await db.fields.delete({
      where: { id: filterId },
    });

    return { message: "Filter deleted successfully" };
  } catch (error) {
    console.error("Error deleting filter:", error);
    throw new Error("Failed to delete filter");
  }
};


export const addProduct=async({businessPageId,name,description,categoryId,images,stock,basePrice,BeforeDiscountPrice,SKU})=>{
  
   try {
     const data=await db.product.create({
         data:{
             businessPageId,
             name,
             description,
             categoryId,
             images,
             stock,
             basePrice,
             BeforeDiscountPrice,
             SKU
             
         }
 
     })
     return {success:true,data}
   } catch (error) {
    console.error("Error creating merchant:", error);
    return { success: false, error: "Something went wrong" };
    
   }

}
export const editProduct = async (productId: number, updates: Partial<{ 
  businessId: number;
  name: string;
  description: string;
  categoryId: number;
  images: string[];
  stock: number;
  basePrice: number;
  BeforeDiscountPrice: number;
  SKU: string;
}>) => {
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
  console.log("Revalidating products...");
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
  console.log("Updating variant relation:", productIdA, productIdB, newRelationType,relationId);

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

  console.log("Revalidating path:", `/dashboard/${businessId}/${pageId}/products`);
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
  console.log("Revalidating path:", `/dashboard/${businessId}/${pageId}/products`);
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



// Example usage
// deleteCategoryFromBusinessPage('some-business-page-id', 3);
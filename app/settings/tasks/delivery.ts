"use server"
import db from "@/db"
import { revalidatePath } from "next/cache";


export const overRideFulfillment = async (orderId: string) => {
  try {
    console.log("Override fulfillment for order:", orderId);

    // 1. Mark all order items as fulfilled
    const updatedItems = await db.orderItem.updateMany({
      where: { orderId },
      data: { productFulfillmentStatus: "fulfilled" },
    });

    if (updatedItems.count === 0) {
      return {
        success: false,
        message: "No items found for this order.",
      };
    }

    // 2. Get `order_id` (external order identifier)
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { order_id: true },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    // 3. Find all tasks linked to this order
    const tasks = await db.task.findMany({
      where: { task_id: order.order_id },
      select: { id: true },
    });

    if (tasks.length === 0) {
      return {
        success: true,
        message: `${updatedItems.count} item(s) fulfilled. No tasks found for this order.`,
      };
    }

    // 4. Mark all tasks as completed
    await db.task.updateMany({
      where: { task_id: order.order_id },
      data: { status: "completed" },
    });

    revalidatePath("/settings/tasks");

    return {
      success: true,
      message: `${updatedItems.count} item(s) fulfilled. ${tasks.length} task(s) marked as completed. (Override mode)`,
    };
  } catch (error) {
    console.error("Error overriding fulfillment:", error);
    return {
      success: false,
      message: "Failed to override fulfillment.",
      error,
    };
  }
};


export const overRideCancellation = async (
  orderId: string,       // internal cuid (Order.id)
  productId: number,
  cancellationReason: string
) => {
  try {
    console.log("Override cancellation for order:", orderId);

    // 1. Cancel the given order item
    const updatedItems = await db.orderItem.updateMany({
      where: {
        orderId: orderId,   // FK to Order.id
        productId: productId,
      },
      data: {
        productFulfillmentStatus: "cancelled",
        cancellationReason,
      },
    });

    if (updatedItems.count === 0) {
      return {
        success: false,
        message: "No items found for this order/product.",
      };
    }

    // 2. Get order + external order_id
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          select: { id: true, productFulfillmentStatus: true },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    // 3. Get tasks linked to this order
    const tasks = await db.task.findMany({
      where: { task_id: order.order_id },
      include: {
        order: {
          select: {
            orderItems: {
              select: { productFulfillmentStatus: true },
            },
          },
        },
      },
    });

    // 4. Cancel only tasks whose orderItems are all cancelled
    let cancelledTasks = 0;
    for (const task of tasks) {
      const allCancelled = task.order.orderItems.every(
        (item) => item.productFulfillmentStatus === "cancelled"
      );
      if (allCancelled) {
        await db.task.update({
          where: { id: task.id },
          data: { status: "cancelled" },
        });
        cancelledTasks++;
      }
    }

    // 5. Cancel the order if ALL items are cancelled
    const remainingItems = order.orderItems.filter(
      (item) => item.productFulfillmentStatus !== "cancelled"
    ).length;

    if (remainingItems === 0) {
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          fulfillmentStatus: "cancelled",
        },
      });
    }

    // 6. Revalidate tasks page
    if (typeof revalidatePath === "function") {
      revalidatePath("/settings/tasks");
    }

    return {
      success: true,
      message: `${updatedItems.count} item(s) cancelled with reason: "${cancellationReason}". ${cancelledTasks} task(s) marked as cancelled. ${
        remainingItems === 0 ? `Order ${order.order_id} marked as cancelled.` : ""
      } (Override mode)`,
    };
  } catch (error) {
    console.error("Error overriding cancellation:", error);
    return {
      success: false,
      message: "Failed to override cancellation.",
      error,
    };
  }
};


export const fulfillItemsByOtp = async (
    orderId: string, // This is Order.id (a string)
    otp: string,
    employeeId: number,

  ) => {
    try {
      console.log("this is order id",orderId)
      // 1. Mark relevant OrderItems as fulfilled
      const updatedItems = await db.orderItem.updateMany({
        where: {
          orderId,
          OTP: otp,

        },
        data: {
          productFulfillmentStatus: "fulfilled",
        },
      });
  
      if (updatedItems.count === 0) {
        return {
          success: false,
          message: "No matching items found for this OTP.",
        };
      }
  
      // 2. Get `order_id` to match with Task.task_id
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { order_id: true },
      });
  
      if (!order) {
        return {
          success: false,
          message: "Order not found.",
        };
      }
  
      // 3. Get the corresponding task assigned to this employee
      const task = await db.task.findFirst({
  where: {
    task_id: order.order_id,
    employeeId,
  },
  orderBy: {
    createdAt: "desc", // or updatedAt, id, etc. depending on your schema
  },
  include: {
    employee: {
      select: { businessId: true },
    },
    order: {
      include: {
        orderItems: {
          include: {
            product: {
              select: { businessPageId: true },
            },
          },
        },
      },
    },
  },
});
  
      if (!task) {
        return {
          success: false,
          message: "Task not found for this employee and order.",
        };
      }
  
      // 4. Check if all items for this business are fulfilled
      const businessId = task.employee.businessId;
      const relevantItems = task.order.orderItems.filter(
        (item) => item.product.businessPageId === businessId
      );
  
      const allFulfilled = relevantItems.every(
        (item) => item.productFulfillmentStatus === "fulfilled"
      );
  
      if (allFulfilled) {
        await db.task.update({
          where: { id: task.id },
          data: { status: "completed" },
        });
      }
      revalidatePath('/settings/tasks')
  
      return {
        success: true,
        message: `${updatedItems.count} item(s) marked as fulfilled.${
          allFulfilled ? " Task marked as completed." : ""
        }`,
      };
    } catch (error) {
      console.error("Error fulfilling order items by OTP:", error);
      return {
        success: false,
        message: "Failed to update product fulfillment status.",
        error,
      };
    }
  };

  export const fulfillNonDliveryItem = async (orderItemId: any) => {
    try {
      await db.orderItem.update({
        where: {
          id: orderItemId,
        },
        data: {
          productFulfillmentStatus: "fulfilled",
        },
      });
    } catch (error) {
      console.error("Error fulfilling non-delivery item:", error);
      throw error; // optional: re-throw if you want to handle it elsewhere
    }
  };
export const  checkAllItemsFulfilled = async (orderId: string) => {
    try {
      // Count total order items for this order
      const totalItems = await db.orderItem.count({
        where: {
          orderId,
        },
      })
  
      // Count fulfilled order items for this order
      const fulfilledItems = await db.orderItem.count({
        where: {
          orderId,
          productFulfillmentStatus: "fulfilled",
        },
      })
     
      // Return true if all items are fulfilled
      if (totalItems > 0 && totalItems === fulfilledItems) {
        revalidatePath('/settings/tasks')
        return true
    }
    return false

    } catch (error) {
      console.error("Error checking order fulfillment status:", error)
      return false
    }
  }
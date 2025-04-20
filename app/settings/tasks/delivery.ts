"use server"
import db from "@/db"
import { revalidatePath } from "next/cache";


export const fulfillItemsByOtp = async (
    orderId: string, // This is Order.id (a string)
    otp: string,
    employeeId: number
  ) => {
    try {
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
      return totalItems > 0 && totalItems === fulfilledItems
    } catch (error) {
      console.error("Error checking order fulfillment status:", error)
      return false
    }
  }
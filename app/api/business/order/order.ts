"use server"
import { subDays,startOfDay } from "date-fns"; // if you're not already importing it
import db from "@/db"
import { parseTwoDigitYear } from "moment";
export const  generateOrderId = () => {
  const timestamp = Date.now().toString(36); // millisecond time in base36
  const random = Math.floor(Math.random() * 1e6).toString(36); // 6-digit random in base36
  return `ORD_${(timestamp + random).toUpperCase()}`; // e.g. ORD_LSZJ5M8K3
};


export const getOrders = async (userId: number) => {
    try {
      const orders = await db.order.findMany({
        where: {
          userId,
          // status: 'completed',
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          order_id: true,
          createdAt: true,
          totalCost:true,
          fulfillmentStatus:true,
          orderItems: {
            select: {
              id: true,
              quantity: true,
              OTP:true,
              productFulfillmentStatus:true,
              cancellationReason:true,
              details:true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images:true,
                  business:{
                    select:{
                        name:true,
                        pageId:true
                    }
                  }
                },
              },
            },
          },
        },
      });
  
      return { success: true, data: orders };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  };




export const getLatestOrdersForEmployee = async (userId: number) => {
  try {
    console.log("Fetching latest orders for employee:", userId);

    // 1. Find all businesses where this user is an employee
    const employees = await db.employee.findMany({
      where: { userId },
      select: { businessId: true },
    });

    if (!employees.length) {
      return {
        success: false,
        message: "No businesses found for this user.",
        data: [],
      };
    }

    const businessIds = employees.map((e) => e.businessId);

    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 7));

    // 2. Get all orders for those businesses in last 7 days
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        orderItems: {
          some: {
            product: {
              businessPageId: { in: businessIds },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        order_id: true,
        userId: true,
        totalCost: true,
        createdAt: true,
        fulfillmentStatus: true,
        address: true,
        tasks: {
          where: {
            businessId: { in: businessIds },
          },
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    userdp: true,
                    userDetails: {
                      select: {
                        phoneNumber: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderItems: {
          where: {
            product: {
              businessPageId: { in: businessIds },
            },
          },
          select: {
            id: true,
            quantity: true,
            customization: true,
            details: true,
            recieveBy: true,
            OTP: true,
            productFulfillmentStatus: true,
            outForDelivery: true,
            product: {
              select: {
                id: true,
                name: true,
                businessPageId: true,
                business: {
                  select: {
                    name: true,
                    dpImageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. Extract unique userIds from orders
    const userIds = Array.from(new Set(orders.map((order) => order.userId)));

    // 4. Fetch user details
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        userDetails: {
          select: {
            phoneNumber: true,
            addresses: true,
          },
        },
      },
    });

    const userMap = new Map<
      number,
      { name: string; phoneNumber: string; addresses: any[] }
    >();
    users.forEach((u) => {
      userMap.set(u.id, {
        name: u.name || "",
        phoneNumber: u.userDetails?.phoneNumber || "",
        addresses: JSON.parse(JSON.stringify(u.userDetails?.addresses || [])),
      });
    });

    // 5. Format final response
    const formattedOrders = orders.map((order) => {
      const userInfo = userMap.get(order.userId) || {
        name: "",
        phoneNumber: "",
        addresses: [],
      };

      return {
        id: order.id,
        order_id: order.order_id,
        userId: order.userId,
        totalCost: order.totalCost,
        createdAt: order.createdAt.toISOString(),
        fulfillmentStatus: order.fulfillmentStatus,
        address: order.address,
        username: userInfo.name,
        userPhone: userInfo.phoneNumber,
        userAddress: userInfo.addresses,
        tasks: order.tasks.map((task) => ({
          ...task,
          employee: {
            ...task.employee,
            user: {
              name: task.employee.user?.name || "",
              email: task.employee.user?.email || "",
              userdp: task.employee.user?.userdp || "",
              phoneNumber: task.employee.user?.userDetails?.phoneNumber || "",
            },
          },
        })),
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          customization: item.customization,
          details: item.details,
          recieveBy: item.recieveBy,
          OTP: item.OTP,
          productFulfillmentStatus: item.productFulfillmentStatus,
          outForDelivery: item.outForDelivery,
          product: {
            id: item.product.id,
            name: item.product.name,
            businessPageId: item.product.businessPageId,
            businessName: item.product.business.name,
            businessImage: item.product.business.dpImageUrl,
          },
        })),
      };
    });

    return {
      success: true,
      data: formattedOrders,
    };
  } catch (error) {
    console.error("❌ Failed to fetch latest orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
};

// Alternative function to check specific date ranges for debugging
export const debugOrdersByDateRange = async (businessPageId: string, startDate: Date, endDate: Date) => {
  try {
    console.log("Debugging orders between:", startDate.toISOString(), "and", endDate.toISOString());
    
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        orderItems: {
          some: {
            product: {
              businessPageId: businessPageId,
            },
          },
        },
      },
      select: {
        id: true,
        order_id: true,
        createdAt: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
                businessPageId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Orders found in date range:", orders);
    return orders;
  } catch (error) {
    console.error("Debug query failed:", error);
    return [];
  }
};
export const getOrdersByBusinessPage = async (businessPageId: string) => {
  try {
    const orders = await db.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              businessPageId: businessPageId
            }
          }
        },
        status: {
          in:["cancelled","completed"]
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        order_id: true,
        userId: true,
        totalCost: true,
        createdAt: true,
        fulfillmentStatus: true,
        tasks: {
          where: { businessId: businessPageId },
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    userdp: true,
                    userDetails: { select: { phoneNumber: true } }
                  }
                }
              }
            }
          }
        },
        orderItems: {
          where: { product: { businessPageId } },
          select: {
            id: true,
            quantity: true,
            customization: true,
            details: true,
            recieveBy: true,
            OTP: true,
            productFulfillmentStatus: true,
            outForDelivery: true,
            product: { select: { id: true, name: true, businessPageId: true } }
          }
        }
      }
    });

    // Fetch user data separately
    const userIds = [...new Set(orders.map(o => o.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        userdp: true,
        userDetails: { select: { phoneNumber: true} }
      }
    });

    // Attach user data to each order
    const ordersWithUser = orders.map(order => ({
      ...order,
      user: users.find(u => u.id === order.userId)
    }));

    return { success: true, data: ordersWithUser };
  } catch (error) {
    console.error("Failed to fetch orders by business page:", error);
    return { success: false, error };
  }
};


  export const MarkOutForDelivery = async (id) => {
    try {
      const updated = await db.orderItem.update({
        where: {
          id
        },
        data: {
          outForDelivery: "TRUE",
        },
      });
      // console.log("delivery data",updated)
       return !!updated
    } catch (error) {
      console.error("Error marking item out for delivery", error);
      return false;
    }
  };
"use server"
import db from "@/db"
export const generateOrderId = () => {
  const timestamp = Date.now().toString(36); // millisecond time in base36
  const random = Math.floor(Math.random() * 1e6).toString(36); // 6-digit random in base36
  return `ORD_${(timestamp + random).toUpperCase()}`; // e.g. ORD_LSZJ5M8K3
};


export const getOrders = async (userId: number) => {
    try {
      const orders = await db.order.findMany({
        where: {
          userId,
          status: 'completed',
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
          status: "completed"
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
          fulfillmentStatus:true,
          tasks: {
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
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          orderItems: {
            where: {
              product: {
                businessPageId: businessPageId,
              }
            },
            select: {
              id:true,
              quantity: true,
              customization: true,
              details: true,
              recieveBy: true,
              OTP:true,
              productFulfillmentStatus:true,
              outForDelivery:true,
              product: {
                select: {
                  id: true,
                  name: true,
                  businessPageId: true,
                }
              }
            }
          }
        }
      });
  
      return { success: true, data: orders };
    } catch (error) {
      console.error("Failed to fetch orders by business page:", error);
      return { success: false, error };
    }
  };


  export const MarkOutForDelivery = async (id: number): Promise<boolean> => {
    try {
      const updated = await db.orderItem.update({
        where: {
          id,
        },
        data: {
          outForDelivery: "TRUE",
        },
      });
  
      return !!updated; // returns true if the update was successful
    } catch (error) {
      console.error("Error marking item out for delivery", error);
      return false;
    }
  };
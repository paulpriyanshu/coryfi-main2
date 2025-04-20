"use server"
import { revalidate } from "@/app/explore/page";
import db from "@/db"
import { revalidatePath } from "next/cache";
export async function createEmployee(userId: number, businessId: string, jobId: number) {
    return await db.employee.create({
      data: {
        userId,
        businessId,
        jobId,
      },
    });
  
}
export async function updateEmployeeJob(employeeId: number, newJobId: number) {
    return await db.employee.update({
      where: { id: employeeId },
      data: {
        jobId: newJobId,
      },
    });
}

export async function deleteEmployee(employeeId: number) {
    return await db.employee.delete({
      where: { id: employeeId },
    });
  
}

export async function addTaskToEmployee(employeeId: number, taskName: string) {
    return await db.task.create({
      data: {
        name: taskName,
        employeeId,
      },
    });
}

export async function markTaskCompleted(taskId: number) {
     await db.task.update({
      where: { id: taskId },
      data: { status: 'completed' },
    });

    const task = await db.task.findUnique({
        where: { id: taskId },
        select: {
          order: {
            select: { id: true }
          }
        }
      });
      console.log("found task",task)

      if (task?.order?.id) {
        return await db.order.update({
          where: { id: task.order.id },
          data: { fulfillmentStatus: "fulfilled" }
        });
      }
    
      throw new Error('Order not found for the given task.');
    
}

export async function getAllEmployees() {
    return await db.employee.findMany({
      include: {
        user: true,
        business: true,
        job: true,
        tasks: true,
      },
    });
}

export async function getAllEmployeesByBusiness(businessPageId) {
    return await db.employee.findMany({
        where:{
            businessId:businessPageId
        },
        include: {
            user: true,
            business: true,
            job: true,
            tasks: true,
          },
  
    });
}

export async function getEmployeeById(employeeId: number) {
    return await db.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        business: true,
        job: true,
        tasks: true,
      },
    });
}

export async function getEmployeesByBusiness(businessId) {
    return await db.employee.findMany({
      where: { businessId },
      include: {
        user: true,
        job: true,
        tasks: true,
      },
    
    });
  }

  export async function searchEmployeesByName({
    businessId,
    nameQuery,
  }: {
    businessId: string;
    nameQuery: string;
  }) {
    return await db.employee.findMany({
      where: {
        businessId,
        user: {
          name: {
            contains: nameQuery,
            mode: "insensitive", // case-insensitive search
          },
        },
      },
      include: {
        user: true,
        job: true,
      },
    });
  }



  export async function addEmployeeByEmail({
    userEmail,
    businessId,
    jobId,
  }: {
    userEmail: string;
    businessId: string;
    jobId?: number; // jobId is now optional
  }) {
    try {
      console.log("Employee details:", userEmail, businessId, jobId);
  
      if (!userEmail || !businessId) {
        throw new Error("Both userEmail and businessId are required.");
      }
  
      const user = await db.user.findUnique({
        where: { email: userEmail },
      });
  
      if (!user) {
        throw new Error("User with this email does not exist.");
      }
  
      // Check if employee already exists for the business
      const existingEmployee = await db.employee.findUnique({
        where: {
          task_employee_unique: {
            userId: user.id,
            businessId: businessId,
          },
        },
      });
  
      if (existingEmployee) {
        return {
          success: false,
          message: "This user is already assigned to this business.",
        };
      }
  
      const employee = await db.employee.create({
        data: {
          userId: user.id,
          businessId: businessId,
          ...(jobId ? { jobId } : {}), // Only include jobId if provided
        },
      });
  
      return {
        success: true,
        message: "Employee added successfully.",
        data: employee,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "An unexpected error occurred.",
      };
    }
  }


  export async function assignTaskToEmployee({
    employeeId,
    companyId,
    businessId,
    orderId,
    taskName,
  }: {
    employeeId: number;
    companyId:string,
    businessId: string;
    orderId: string;
    taskName: string;
  }) {
    try {
      const employee = await db.employee.findFirst({
        where: {
          id: employeeId,
          businessId,
        },
      });
  
      if (!employee) {
        throw new Error("Employee not found in this business.");
      }
  
      const order = await db.order.findUnique({
        where: {
          order_id: orderId,
        },
      });
  
      if (!order) {
        throw new Error("Order not found.");
      }
  
      const task = await db.task.create({
        data: {
          name: taskName,
          task_id: orderId, // This is the string that references order.order_id
          employeeId,       // Directly assigning FK
        },
      });
      revalidatePath(`/dashboard/${companyId}/${businessId}/orders`)
  
      return {
        success: true,
        message: "Task successfully assigned.",
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error occurred.",
      };
    }
  }



  export async function assignTaskToAllEmployees({
    businessIds,
    orderId,
    taskName,
  }: {
    businessIds: string[];
    orderId: string;
    taskName: string;
  }) {
    try {
      const assignedTasks = [];
  
      const order = await db.order.findUnique({
        where: {
          order_id: orderId,

        },
      });
  
      if (!order) {
        throw new Error("Order not found.");
      }
  
      for (const businessId of businessIds) {
        const employees = await db.employee.findMany({
          where: { businessId },
        });
  
        if (!employees.length) {
          console.warn(`No employees found for business ID: ${businessId}`);
          continue;
        }
  
        for (const employee of employees) {
          const existing = await db.task.findFirst({
            where: {
              task_id: orderId,
              employeeId: employee.id,
            },
          });
  
          if (!existing) {
            const task = await db.task.create({
              data: {
                name: taskName,
                task_id: orderId,
                employeeId: employee.id,
              },
            });
  
            assignedTasks.push(task);
          }
        }
      }
  
      return {
        success: true,
        message: `${assignedTasks.length} new task(s) assigned.`,
        data: assignedTasks,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error occurred.",
      };
    }
  }
export async function getBusinessInfoFromOrder(orderId: string) {
    try {
      const orderWithItems = await db.order.findUnique({
        where: { order_id: orderId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  businessPageId: true, // ensure this field exists in your Product model
                },
              },
            },
          },
        },
      });
  
      if (!orderWithItems || orderWithItems.orderItems.length === 0) {
        return {
          success: false,
          message: "No order items found for this order.",
        };
      }
  
      // Extract all businessPageIds
      const businessIds = [
        ...new Set(
          orderWithItems.orderItems
            .map((item) => item.product?.businessPageId)
            .filter(Boolean) // remove null/undefined
        ),
      ];
  
      return {
        success: true,
        businessIds,
      };
    } catch (error) {
      console.error("Error fetching business info:", error);
      return {
        success: false,
        message: "Error fetching business info.",
        error,
      };
    }
  }
  

  export async function getAssignedTasksForEmployee(userId: number) {
    try {
      const employees = await db.employee.findMany({
        where: { userId },
        select: {
          id: true,
          businessId: true,
        },
      });
  
      if (!employees.length) {
        return {
          success: false,
          message: "No employee record found for this user.",
          data: [],
        };
      }
  
      const employeeMap = new Map<number, string>();
      employees.forEach((emp) => {
        employeeMap.set(emp.id, emp.businessId);
      });
  
      const tasks = await db.task.findMany({
        where: {
          employeeId: {
            in: Array.from(employeeMap.keys()),
          },
        },
        include: {
          order: {
            include: {
              orderItems: {
                include: {
                  product: {
                    include: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Get all unique userIds from the tasks
      const userIds = Array.from(new Set(tasks.map((task) => task.order.userId)));
  
      // Fetch user names in bulk
      const users = await db.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          name: true,
        },
      });
  
      // Map userId to name
      const userMap = new Map(users.map((u) => [u.id, u.name]));
  
      const filteredTasks = tasks
        .map((task) => {
          const businessId = employeeMap.get(task.employeeId);
          const filteredItems = task.order.orderItems.filter(
            (item) =>
              item.product?.businessPageId === businessId &&
              item.recieveBy?.type !== "TAKEAWAY" &&
              item.recieveBy?.type !== "DINEIN"
          );
  
          return {
            id: task.id,
            name: task.name,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            task_id: task.task_id,
            employeeId: task.employeeId,
            businessId,
            order: {
              id: task.order.id,
              order_id: task.order.order_id,
              userId: task.order.userId,
              userName: userMap.get(task.order.userId) || null, // ✅ add user name here
              totalCost: task.order.totalCost,
              status: task.order.status,
              fulfillmentStatus: task.order.fulfillmentStatus,
              address: task.order.address,
              createdAt: task.order.createdAt,
              updatedAt: task.order.updatedAt,
              orderItems: filteredItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                details: item.details,
                productFulfillmentStatus: item.productFulfillmentStatus,
                otp: item.OTP,
                customization: item.customization,
                recieveBy: item.recieveBy,
                product: item.product,
                outForDelivery:item.outForDelivery,
                businessImage:item.product.business.dpImageUrl,
                businessName:item.product.business.name
              })),

            },
          };
        })
        .filter((task) => task.order.orderItems.length > 0);
  
      return {
        success: true,
        message: `${filteredTasks.length} task(s) retrieved.`,
        data: filteredTasks,
      };
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unexpected error occurred.",
        data: [],
      };
    }
  }
  export async function deleteTaskAssignment(taskId: string, employeeId: number , businessPageId,businessId) {
    try {
      const deletedTask = await db.task.delete({
        where: {
          task_id_employeeId: {
            task_id: taskId,
            employeeId: employeeId,
          },
        },
      });
  
      console.log('Task assignment deleted:', deletedTask);
      revalidatePath(`/dashboard/${businessId}/${businessPageId}/employees`)
      return deletedTask;
    } catch (error) {
      console.error('Error deleting task assignment:', error);
      throw error;
    }
  }


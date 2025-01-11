'use server';
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import db from "@/db"
import { fetchUserId } from "./media";
import { createUserChat } from "@/components/ui/sections/api";
import { getSession } from "next-auth/react";

const prisa = new PrismaClient();

export const check_connection=async(requesterEmail:string,recipientEmail:string)=>{
  if (!requesterEmail || !recipientEmail ) {
    throw new Error(' requesterEmail ,recipientEmail and StrengthLevel are required.');
  }

  // Retrieve user IDs based on emails
  const requester = await db.user.findUnique({
    where: { email: requesterEmail },
  });

  const recipient = await db.user.findUnique({
    where: { email: recipientEmail },
  });

  if (!requester || !recipient) {
    throw new Error('One or both emails are not associated with a valid user.');
  }

  const { id: requesterId } = requester;
  const { id: recipientId } = recipient;

  const existingConnection = await db.connection.findFirst({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      OR: [
        { requesterId, recipientId }, // Original direction
        { requesterId: recipientId, recipientId: requesterId }, // Reversed direction
      ],
    },
  });
  if (existingConnection) {
      return true
  }
  return false

}

export const connect_users = async (
  requesterEmail: string,
  recipientEmail: string,
  StrengthLevel: any
) => {
  console.log("Strength Level", StrengthLevel);
  console.log("emails", requesterEmail, recipientEmail);
  try {
    // Validate input
    if (!requesterEmail || !recipientEmail || !StrengthLevel) {
      throw new Error("RequesterEmail, recipientEmail, and StrengthLevel are required.");
    }

    // Retrieve user IDs based on emails
    const requester = await db.user.findUnique({
      where: { email: requesterEmail },
    });

    const recipient = await db.user.findUnique({
      where: { email: recipientEmail },
    });

    if (!requester || !recipient) {
      throw new Error("One or both emails are not associated with a valid user.");
    }

    const { id: requesterId } = requester;
    const { id: recipientId } = recipient;

    // Check if there is an existing connection with status PENDING or APPROVED
    const existingConnection = await db.connection.findFirst({
      where: {
        status: { in: ["PENDING", "APPROVED"] }, // Block if status is PENDING or APPROVED
        OR: [
          { requesterId, recipientId }, // Original direction
          { requesterId: recipientId, recipientId: requesterId }, // Reversed direction
        ],
      },
    });

    if (existingConnection) {
      console.log("Connection already exists:", existingConnection.status);
      throw new Error("A connection request already exists with status PENDING or APPROVED.");
    }

    // Create a new connection request (allowed if no PENDING or APPROVED status exists)
    const connection = await db.connection.create({
      data: {
        requesterId,
        recipientId,
        StrengthLevel,
        status: "PENDING", // Initial status
      },
    });

    return { success: true, connection };
  } catch (error) {
    console.error("Error creating connection request:", error);
    return { success: false, error: error.message };
  }
};  
export const approve_request = async (requesterEmail: string, recipientEmail: string) => {
    try {
      // Validate input
      if (!requesterEmail || !recipientEmail) {
        throw new Error('Both requesterEmail and recipientEmail are required.');
      }
  
      // Retrieve user IDs based on emails
      const requester = await db.user.findUnique({
        where: { email: requesterEmail },
      });
  
      const recipient = await db.user.findUnique({
        where: { email: recipientEmail },
      });
  
      if (!requester || !recipient) {
        throw new Error('One or both emails are not associated with a valid user.');
      }
  
      const { id: requesterId } = requester;
      const { id: recipientId } = recipient;
  
      // Check if a connection request exists
      const connectionRequest = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Sort by creation time, descending
        },
      });
  
      if (!connectionRequest) {
        throw new Error('No connection request found.');
      }
  
      if (connectionRequest.status !== 'PENDING') {
        throw new Error('The connection request is not in a pending state.');
      }
  
      // Update the connection status to APPROVED
      const updatedConnection = await db.connection.update({
        where: {
          id:connectionRequest.id
        },
        data: {
          status: 'APPROVED',
        },
      });
  
      return { success: true, connection: updatedConnection };
    } catch (error) {
      console.error('Error approving connection request:', error);
      return { success: false, error: error.message };
    }
  };
  export const reject_request = async (requesterEmail: string, recipientEmail: string) => {
    try {
      // Validate input
      if (!requesterEmail || !recipientEmail) {
        throw new Error('Both requesterEmail and recipientEmail are required.');
      }
  
      // Retrieve user IDs based on emails
      const requester = await db.user.findUnique({
        where: { email: requesterEmail },
      });
  
      const recipient = await db.user.findUnique({
        where: { email: recipientEmail },
      });
  
      if (!requester || !recipient) {
        throw new Error('One or both emails are not associated with a valid user.');
      }
  
      const { id: requesterId } = requester;
      const { id: recipientId } = recipient;
  
      // Check if a connection request exists
      const connectionRequest = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Sort by creation time in descending order
        },
      });
  
      if (!connectionRequest) {
        throw new Error('No connection request found.');
      }
  
      if (connectionRequest.status !== 'PENDING') {
        throw new Error('The connection request is not in a pending state.');
      }
  
      // Update the connection status to APPROVED
      const updatedConnection = await db.connection.update({
        where: {
          id:connectionRequest.id
        },
        data: {
          status: 'REJECTED',
        },
      });
  
      return { success: true, connection: updatedConnection };
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Fetch all new connection requests for a user
  export const get_new_requests = async (email: string) => {
    try {
      // Validate input
      if (!email) {
        throw new Error('Email is required.');
      }
  
      // Retrieve user ID based on email
      const user = await db.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        throw new Error('No user found with the given email.');
      }
      console.log("fetching user id ",user)
      const { id: recipientId } = user;
      console.log("fetched user id ",recipientId)
      // Fetch pending connection requests
      const newRequests = await db.connection.findMany({
        where: {
          recipientId,
          status: 'PENDING',
        },
        include: {
          requester: true, // Include requester details
          
        },
      });
  
      return { success: true, requests: newRequests };
    } catch (error) {
      console.error('Error fetching new connection requests:', error);
      return { success: false, error: error.message };
    }
  };
export const intermediaryUserList=async(list:any)=>{
  console.log("intermediataryUserList",list)
  return list;
}
export const createConnectionRequest = async (
    requesterEmail: string,
    recipientEmail: string,
    intermediaries: { email: string }[] // Array of intermediary users (email-based)
  ) => {
    try {
      console.log(`Requester: ${requesterEmail}, Recipient: ${recipientEmail}`);
      
      // Input validation
      if (!requesterEmail || !recipientEmail || intermediaries.length === 0) {
        throw new Error("Requester, recipient, and intermediaries are required.");
      }
  
      if (typeof requesterEmail !== "string" || typeof recipientEmail !== "string") {
        throw new Error("Requester and recipient emails must be strings.");
      }
  
      // Fetch requester and recipient from the database
      const [requester, recipient] = await Promise.all([
        db.user.findUnique({
          where: { email: requesterEmail },
        }),
        db.user.findUnique({
          where: { email: recipientEmail },
        }),
      ]);
  
      if (!requester) {
        throw new Error(`Requester with email ${requesterEmail} not found.`);
      }
      if (!recipient) {
        throw new Error(`Recipient with email ${recipientEmail} not found.`);
      }
  
      // Fetch intermediary users from the database
      const intermediaryEmails = intermediaries.map((intermediary) => intermediary.email);
          console.log("Intermediary emails:", intermediaryEmails);

          const UnorderedIntermediaryUsers = await db.user.findMany({
            where: {
              email: { in: intermediaryEmails },
            },
          });
          console.log("Intermediary users (unordered):", UnorderedIntermediaryUsers);

          // Reorder `UnorderedIntermediaryUsers` to match the sequence of `intermediaryEmails`
          const intermediaryUsers = intermediaryEmails.map((email) =>
            UnorderedIntermediaryUsers.find((user) => user.email === email)
          );

          console.log("Intermediary users (ordered):", intermediaryUsers);

  
      if (UnorderedIntermediaryUsers.length !== intermediaries.length) {
        throw new Error("One or more intermediaries not found.");
      }
  
      console.log(`Requester ID: ${requester.id}, Recipient ID: ${recipient.id}`);
  
      // Create the Evaluation record
      const evaluation = await db.evaluation.create({
        data: {
          requesterId: requester.id,
          recipientId: recipient.id,
          status: "ONGOING",
        },
      });
  
      console.log("Evaluation created:", evaluation);
  
      // Create an entry in the Connection table
      const connection = await db.evaluationApprovals.create({
        data: {
          evaluationIds: [evaluation.id], // Initialize the array with the evaluation ID
          requesterId: requester.id,
          recipientId: recipient.id,
          status: "PENDING", // Initial status
        },
      });
      console.log("Connection created:", connection);
  
      // Create Path records for each intermediary
      console.log("Creating paths...");
      console.log("Intermediatery data",intermediaryUsers)
      const pathsData = intermediaryUsers.map((intermediary, index) => ({
        evaluationId: evaluation.id,
        intermediaryId: intermediary.id,
        order: index + 1,
        new_order: index === 0 ? 1 : -1, // Initialize `new_order` for the first intermediary
        approved: "FALSE",
      }));
      console.log("paths data",pathsData)
  
      const paths = await db.path.createMany({
        data: pathsData,
      });
  
      console.log("Paths created:", paths);
  
      return {
        success: true,
        message: "Connection request created successfully.",
        evaluationId: evaluation.id,
      };
    } catch (error) {
      console.error("Error creating connection request:", error);
      return { success: false, error: error.message };
    }
  };
// Install axios if not already: npm install axios
export const handleRejection = async (
  evaluationId: number,
  rejectingUserEmail: string
) => {
  try {
    console.log(`Handling rejection for Evaluation ID: ${evaluationId}`);

    // Fetch the evaluation to ensure it exists
    const evaluation = await db.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error("Evaluation not found.");
    }

    console.log(
      `Evaluation found. Status: ${evaluation.status}. Checking rejecting user...`
    );

    // Fetch the connection details to get the recipient and intermediary details
    const connection = await db.evaluationApprovals.findFirst({
      where: {
        evaluationIds:{
          has:evaluationId
        },
      },
    });

    if (!connection) {
      throw new Error("Connection not found for this evaluation.");
    }

    console.log(`Connection found. Evaluating rejection status...`);

    // Identify if the rejecting user is the final recipient or an intermediary
    // const isFinalRecipient = connection.recipientEmail === rejectingUserEmail;
    const rejectingUser=await db.user.findUnique({
      where:{
        email:rejectingUserEmail
      }
    })
    const isFinalRecipient=rejectingUser.email===rejectingUserEmail;
    if (!isFinalRecipient) {
      // Check if the rejecting user is an intermediary
      const intermediaryPath = await db.path.findFirst({
        where: {
          evaluationId,
          intermediaryId: rejectingUser.id,
        },
      });

      if (!intermediaryPath) {
        throw new Error("Rejecting user is neither an intermediary nor the final recipient.");
      }

      console.log("Rejecting user is an intermediary.");
    } else {
      console.log("Rejecting user is the final recipient.");
    }

    // Determine the appropriate status based on rejection context
    const newStatus = isFinalRecipient ? "REJECTED" : "INTERRUPTED";

    console.log(
      `Rejecting user is ${isFinalRecipient ? "final recipient" : "intermediary"}. Setting status: ${newStatus}`
    );

    // Update the connection status
    await db.evaluationApprovals.updateMany({
      where: {
        evaluationIds: {
          has: evaluationId, // Check if evaluationId exists in the array
        },
      },
      data: { status: newStatus },
    });

    console.log(`Connection status updated to: ${newStatus}`);

    // Update the evaluation status to reflect rejection
    await db.evaluation.update({
      where: { id: evaluationId },
      data: { status: "REJECTED" },
    });
    console.log("evalualtion table updated")
    console.log("this is rejecting user id",rejectingUser.id,"and evaluation id",evaluationId)
    await db.path.update({
      where: {
        evaluationId_intermediaryId: {
          evaluationId: evaluationId,
          intermediaryId: rejectingUser.id,
        },
      },
      data: {
        approved: "REJECTED",
      },
    });

    console.log("Evaluation status updated to REJECTED");

    return {
      success: true,
      message: `Connection status set to ${newStatus} due to rejection.`,
    };
  } catch (error) {
    console.error("Error handling rejection:", error);
    return { success: false, error: error.message };
  }
};
export const handleApproval = async (
  evaluationId: any,
  intermediaryEmail: any
) => {
  try {
    console.log(
      `Processing approval for evaluation ${evaluationId} by ${intermediaryEmail}`
    );
    

    // Input validation
    if (!evaluationId || !intermediaryEmail) {
      throw new Error("Evaluation ID and intermediary email are required.");
    }

    // Fetch the evaluation and intermediary details
    const evaluation = await db.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error("Evaluation not found.");
    }

    const intermediary = await db.user.findUnique({
      where: { email: intermediaryEmail },
    });

    if (!intermediary) {
      throw new Error("Intermediary not found.");
    }

    // Fetch the corresponding Path record
    const path = await db.path.findFirst({
      where: {
        evaluationId: evaluationId,
        intermediaryId: intermediary.id,
      },
    });
    console.log("this is path",path)

    if (!path) {
      throw new Error("Path not found for this intermediary.");
    }

    if (path.approved==='TRUE') {
      throw new Error("This intermediary has already approved.");
    }

    console.log(
      `Path found for intermediary ${intermediaryEmail}. Marking as approved.`
    );

    // Update the Path record to mark as approved
    await db.path.update({
      where: { id: path.id },
      data: { approved: "TRUE" },
    });

    console.log(`Intermediary ${intermediaryEmail} approved successfully.`);

    // Check if all intermediaries have approved
    const pendingPaths = await db.path.findMany({
      where: {
        evaluationId: evaluationId,
        approved: "FALSE",
      },
    });
    console.log("pending paths",pendingPaths)
    console.log("number of pending paths ",pendingPaths.length-1);

    if (pendingPaths.length===0) {
      // All intermediaries have approved, mark the evaluation as completed
      await db.evaluation.update({
        where: { id: evaluationId },
        data: { status: "COMPLETED" },
      });

      console.log(`Evaluation ${evaluationId} marked as COMPLETED.`);

      // Update the Connection table to mark the connection as connected
      await db.evaluationApprovals.updateMany({
        where: {
          evaluationIds: { has: evaluationId }, // Check if evaluationId exists in the array
        },
        data: {
          evaluationWorked: evaluationId, // Set the evaluationWorked field
          status: "CONNECTED", // Update status to CONNECTED
        },

      });

      const requester = await db.user.findUnique({
        where: { id: evaluation.requesterId },
      });

      const recipient = await db.user.findUnique({
        where: { id: evaluation.recipientId },
      });
       if (requester && recipient) {
          // POST to the API
          const relationshipPayload = {
            email1: requester.email,
            email2: recipient.email,
            strength: 9, // Set strength as required
          };
          console.log("inside the connection api",relationshipPayload.email1,relationshipPayload.email2)
          // const id1=await fetchUserId(relationshipPayload.email1)
          // const id2=await fetchUserId(relationshipPayload.email2)
          const id1=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${relationshipPayload.email1}`)
          const id2=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${relationshipPayload.email2}`)
          console.log("these are the ids",id2.data.data._id,id1.data.data._id)
          try {
            const response=await createUserChat(id2.data.data._id,id1.data.data._id)
            console.log("this is chat response",response.data.data)


      
          } catch (error) {
            
          }
          // const handleCreateChat = async (receiverId) => {
          //   try {
          //     console.log("this is reciever id",receiverId)
          //     const response = await createUserChat(receiverId,currentUserId);
        
          //     const newChat = response.data.data;

          //     toast.success("Chat created successfully");
          //   } catch (error) {
          //     console.error("Error creating chat:", error);
          //     toast.error("Failed to create chat");
          //   }
          // };
        }
      } else {
        console.log(
          `Evaluation ${evaluationId} still has ${pendingPaths.length} pending approvals.`
        );
      }


    console.log(`Connection for evaluation ${evaluationId} marked as CONNECTED.`);
    

    // Update the order of all paths
    const allPaths = await db.path.findMany({
      where: { evaluationId: evaluationId },
      orderBy: { order: "asc" }, // Ensure the paths are ordered
    });
 
    
    // const initiatorUser=await db.path.findFirst({
    //   where: { evaluationId: evaluationId , order : path.order},
    //   include: {
    //     intermediary: {
    //       select: {
    //         email: true, // Fetch the intermediary user's email
    //       },
    //     },
    //     evaluation: {
    //       select: {
    //         requester: {
    //           select: {
    //             email: true, // Fetch the requester's email
    //           },
    //         },
    //         recipient: {
    //           select: {
    //             email: true, // Fetch the recipient's email
    //           },
    //         },
    //       },
    //     },
    //   },

    // })
    // console.log("initiator user",initiatorUser)

    const nextPath = await db.path.findFirst({
      where: {
        evaluationId: evaluationId,
        order: path.order + 1,
      },
      include: {
        intermediary: {
          select: {
            email: true, // Fetch the intermediary user's email
          },
        },
        evaluation: {
          select: {
            requester: {
              select: {
                email: true, // Fetch the requester's email
              },
            },
            recipient: {
              select: {
                email: true, // Fetch the recipient's email
              },
            },
          },
        },
      },
    });
    if(!nextPath)  return { success: true, message: "Approval processed successfully." };
    console.log("this is next path",nextPath)
    const nextPathUserId=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${nextPath.intermediary.email}`)
    const initiatorUser=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${nextPath?.evaluation?.requester?.email}`)
    console.log("this is current user id",initiatorUser.data)
    console.log("this is nexpath user id",nextPathUserId.data.data)
    await createUserChat(nextPathUserId.data.data._id,initiatorUser.data.data._id)
    console.log("created chat")

    let order = 0;
    for (const p of allPaths) {
      await db.path.update({
        where: { id: p.id },
        data: { new_order: p.approved==="TRUE" ? 0 : ++order },
      });
    }

    console.log(`Path orders updated for evaluation ${evaluationId}.`);

    return { success: true, message: "Approval processed successfully." };
  } catch (error) {
    console.error("Error handling approval:", error);
    return { success: false, error: error.message };
  }
};
  export async function fetchRequestsForIntermediary(intermediaryEmail: string) {
    try {
      console.log("fetching requests from",intermediaryEmail)
      // Input validation
      if (!intermediaryEmail) {
        throw new Error('Intermediary email is required and must be a string.');
      }
      // const pre_requests = await db.path.findMany({
      //   where:{
      //     intermediary:{
      //       email:intermediaryEmail
      //     }

      //   }
      // })
      // console.log("this is pre request",pre_requests)
      // Query the database to find evaluations where the given email is the first intermediary
      
      const requests = await db.path.findMany({
        where: {
          intermediary: {
            email: intermediaryEmail,
          },
          new_order: 1, // Ensures the intermediary is the first in the chain
          approved:"FALSE"
        },
        include: {
          evaluation: {
            include: {
              requester: {
                select: { id: true, email: true, name: true },
              },
              recipient: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      });
      console.log("these are raw requests",requests)
  
      // Format the response
      const formattedRequests = requests.map((path) => ({
        evaluationId: path.evaluationId,
        requester: path.evaluation.requester,
        recipient: path.evaluation.recipient,
        status: path.evaluation.status,
        createdAt: path.createdAt,
      }));
      console.log("these formatted Requests",formattedRequests)
      return { success: true, data: formattedRequests };
    } catch (error) {
      console.error('Error fetching requests for intermediary:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Simulated waitForApproval function
  // async function waitForApproval(email: string): Promise<boolean> {
  //   // Simulate asynchronous approval process
  //   console.log(`Waiting for approval from ${email}...`);
  //   return new Promise((resolve) =>
  //     setTimeout(() => resolve(Math.random() > 0.3), 2000) // 70% chance of approval
  //   );
  // }
  
  // // This function waits for approval, this needs to be implemented
  // // It's a placeholder for actual approval logic
  // const waitForApproval = async (email: string): Promise<boolean> => {
  //   // You need to implement this function to check whether the intermediary has approved the request
  //   // This can be done using an API endpoint, a UI-based process, or real-time communication via WebSockets
    
  //   // Example placeholder (can be replaced with actual logic)
  //   // In a real-world scenario, you would use an event or API call that waits for a response from the intermediary
  //   return new Promise((resolve) => {
  //     // Simulating a delay for approval (replace with real approval process)
  //     setTimeout(() => {
  //       // Here you will return `true` if approved or `false` if not approved
  //       resolve(true);  // Assuming approved for now, replace with actual logic
  //     }, 1000); // Simulate delay (for demo purposes)
  //   });
  // };
  
  // Helper function to simulate the approval process
  // const simulateApproval = async (email: string): Promise<boolean> => {
  //   // Simulate approval by an intermediary (for testing purposes)
  //   // Replace with actual logic to send notifications/emails to intermediaries
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       const approved = Math.random() > 0.2; // 80% chance of approval
  //       resolve(approved);
  //     }, 1000); // Simulate delay for approval
  //   });
  // };
  
  // Helper function to simulate the approval process
;
  // export const approveByIntermediary = async (
  //   intermediaryEmail: string,
  //   connectionId: number
  // ) => {
  //   try {
  //     const connection = await db.connection.findUnique({
  //       where: { id: connectionId },
  //     });
  
  //     if (!connection) {
  //       throw new Error("Connection request not found.");
  //     }
  
  //     if (!connection.intermediaries.includes(intermediaryEmail)) {
  //       throw new Error("You are not an intermediary for this request.");
  //     }
  
  //     if (connection.approvedBy.includes(intermediaryEmail)) {
  //       throw new Error("You have already approved this request.");
  //     }
  
  //     // Add intermediary approval
  //     const updatedConnection = await db.connection.update({
  //       where: { id: connectionId },
  //       data: {
  //         approvedBy: {
  //           push: intermediaryEmail,
  //         },
  //       },
  //     });
  
  //     // Check if all intermediaries have approved
  //     if (
  //       updatedConnection.approvedBy.length ===
  //       updatedConnection.intermediaries.length
  //     ) {
  //       await db.connection.update({
  //         where: { id: connectionId },
  //         data: { stage: "FINAL" },
  //       });
  //     }
  
  //     return { success: true, connection: updatedConnection };
  //   } catch (error) {
  //     console.error("Error approving connection request:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  // export const get_intermediary_requests = async (recipientEmail: string) => {
  //   try {
  //     // Validate input 
  //     if (!recipientEmail) {
  //       throw new Error('Recipient email is required.');
  //     }
  
  //     // Retrieve recipient ID based on email
  //     const recipient = await db.user.findUnique({
  //       where: { email: recipientEmail },
  //     });
  
  //     if (!recipient) {
  //       throw new Error('No user found with the given email.');
  //     }
  
  //     const { id: recipientId } = recipient;

  //     // Fetch connection requests with status 'INTERMEDIARY'
  //     const intermediaryRequests = await db.connection.findMany({
  //       where: {
  //         recipientId,
  //         stage: 'INTERMEDIARY', // Only fetch connections with 'INTERMEDIARY' status
  //       },
  //       include: {
  //         requester: true, // Include requester details
  //       },
  //     });
  
  //     if (intermediaryRequests.length === 0) {
  //       console.log('No intermediary requests found.');
  //     } else {
  //       console.log('Intermediary connection requests:', intermediaryRequests);
  //     }
  
  //     return { success: true, requests: intermediaryRequests };
  //   } catch (error) {
  //     console.error('Error fetching intermediary connection requests:', error);
  //     return { success: false, error: error.message };
  //   }
  // };


  // export const approveFinalConnection = async (recipientEmail, connectionId) => {
  //   try {
  //     const connection = await db.connection.findUnique({
  //       where: { id: connectionId },
  //     });
  
  //     if (!connection) {
  //       throw new Error("Connection request not found.");
  //     }
  
  //     const recipient = await db.user.findUnique({
  //       where: { id: connection.recipientId },
  //     });
  
  //     if (!recipient || recipient.email !== recipientEmail) {
  //       throw new Error("You are not the intended recipient of this request.");
  //     }
  
  //     if (connection.stage !== "FINAL") {
  //       throw new Error("The connection request is not in the final stage.");
  //     }
  
  //     const updatedConnection = await db.connection.update({
  //       where: { id: connectionId },
  //       data: {
  //         status: "APPROVED",
  //         acceptedAt: new Date(),
  //       },
  //     });
  
  //     return { success: true, connection: updatedConnection };
  //   } catch (error) {
  //     console.error("Error approving final connection:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  export const updateUserProfile=async(input)=> {
    const { userId, name, email, userDetails } = input;
    console.log("userdetials being saved",userDetails)
    try {
      // Update user profile
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          userdp:userDetails.displayImage,
          userDetails: userDetails
            ? {
                upsert: {
                  create: userDetails,
                  update: userDetails,
                },
              }
            : undefined,
        },
        include: {
          userDetails: true, // Include the updated details in the response
        },
      });
      if(name){
        const updateMongoUser=await axios.post(`https://chat.coryfi.com/api/v1/users/editUser/`,{
          email,
          name
        })
        console.log("mongo user updated",updateMongoUser)
      }
      
  
      console.log('User profile updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }
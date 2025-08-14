"use server"
import db from "@/db"
import { isAfter } from "date-fns"
import { revalidatePath } from "next/cache"

export const  checkPathsFlow=async(email:string)=>{
    try {
        const user=await db.user.findFirst({
            where:{
                email
            }
        })
        if(user.introductoryFlow){
            return true
        }
        return false
    } catch (error) {
        console.log("error while checking path flow",error)
        return error
    }

}

export const  doneIntroductoryFlow=async(email:string)=>{
    try {
        const user=await db.user.update({
            where:{
                email
            },
            data:{
                introductoryFlow:true
            }
        })
        
        return user
    } catch (error) {
        console.log("error while checking path flow",error)
        return error
    }

}




export const checkUserPremiumStatus = async (userEmail: string): Promise<boolean> => {
  try {
    // Get user first
    const user = await db.user.findFirst({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      console.log("User not found");
      return false;
    }

    // Get the latest subscription (assuming later createdAt means most recent)
    const subscription = await db.premiumSubscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      console.log("No subscriptions found");
      return false;
    }

    const isActive = isAfter(new Date(subscription.expiry), new Date());

    console.log("Subscription active:", isActive);

    return isActive;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

export async function getTop8MostConnectedUsers(email: string) {
  // Step 0: Get the current user by email
  const currentUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!currentUser) throw new Error("User not found");
  const currentUserId = currentUser.id;

  // Step 1: Check if user already has at least 5 APPROVED or PENDING connections
  const connectionCount = await db.connection.count({
    where: {
      OR: [
        { requesterId: currentUserId },
        { recipientId: currentUserId },
      ],
      status: { in: ["APPROVED", "PENDING"] },
    },
  });

  if (connectionCount >= 5) {
    return false; // User already has 5 or more connections
  }

  // Step 2: Get IDs of users already connected (APPROVED or PENDING)
  const connectedUsers = await db.connection.findMany({
    where: {
      OR: [
        { requesterId: currentUserId },
        { recipientId: currentUserId },
      ],
      status: { in: ["APPROVED", "PENDING"] },
    },
    select: {
      requesterId: true,
      recipientId: true,
    },
  });

  const excludedUserIds = new Set<number>();
  for (const conn of connectedUsers) {
    if (conn.requesterId !== currentUserId) excludedUserIds.add(conn.requesterId);
    if (conn.recipientId !== currentUserId) excludedUserIds.add(conn.recipientId);
  }
  excludedUserIds.add(currentUserId); // Also exclude self

  // Step 3: Get approved connection counts as requester
  const requesterCounts = await db.connection.groupBy({
    by: ['requesterId'],
    where: { status: "APPROVED" },
    _count: { requesterId: true },
  });

  // Step 4: Get approved connection counts as recipient
  const recipientCounts = await db.connection.groupBy({
    by: ['recipientId'],
    where: { status: "APPROVED" },
    _count: { recipientId: true },
  });

  // Step 5: Combine both counts into a Map<userId, totalConnections>
  const connectionMap = new Map<number, number>();

  for (const { requesterId, _count } of requesterCounts) {
    if (!excludedUserIds.has(requesterId)) {
      connectionMap.set(requesterId, (connectionMap.get(requesterId) || 0) + _count.requesterId);
    }
  }

  for (const { recipientId, _count } of recipientCounts) {
    if (!excludedUserIds.has(recipientId)) {
      connectionMap.set(recipientId, (connectionMap.get(recipientId) || 0) + _count.recipientId);
    }
  }

  // Step 6: Sort users by totalConnections and take top 8
  const sorted = [...connectionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topUserIds = sorted.map(([userId]) => userId);

  // Step 7: Fetch user data for the top users
  const users = await db.user.findMany({
    where: { id: { in: topUserIds } },
    include: { userDetails: true },
  });

  // Step 8: Attach totalConnections to user objects
  const usersWithCount = users.map(user => ({
    ...user,
    totalConnections: connectionMap.get(user.id) || 0,
  }));

  // Step 9: Return sorted result
    return {
    alreadyConnected: false,
    connectionCount,
    users: usersWithCount.sort((a, b) => b.totalConnections - a.totalConnections),
  };
}


export async function saveUserSubcategories(userId: number, subcategoryIds: number[]) {
  if (!userId || !Array.isArray(subcategoryIds) || subcategoryIds.length === 0) {
    throw new Error("Invalid input: userId or subcategoryIds missing.");
  }

  // Ensure all provided subcategories exist
  const validSubs = await db.interestSubcategory.findMany({
    where: { id: { in: subcategoryIds } },
    select: { id: true },
  });
  console.log("valide subs",validSubs)
  console.log("subcategores",subcategoryIds)
  if (validSubs.length !== subcategoryIds.length) {
    throw new Error("Some subcategories do not exist.");
  }

  // Remove old selections
  await db.userSubcategory.deleteMany({
    where: { userId },
  });

  // Add new selections
  await db.userSubcategory.createMany({
    data: subcategoryIds.map((id) => ({
      userId,
      subcategoryId: id,
    })),
  });

  return { success: true, count: subcategoryIds.length };
}
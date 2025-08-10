// app/actions/pathActions.ts
'use server'

import axios from 'axios';
import db from "@/db"
export async function findPath(email: string) {
  try {
    const response = await axios.post("https://neo.coryfi.com/api/v1/getpathranking", {
      targetEmail: email,
      sourceEmail: email, // Replace with actual source email if available
      pathIndex: 0,
    });
    return response.data;
  } catch (error) {
    console.error("Error finding path:", error);
    throw new Error("Failed to find path");
  }
}
export async function getPathRanking(userEmail: string, targetEmail: string, index?: number) {
     console.log("path index",index)
  try {
    const payload: Record<string, any> = {
      sourceEmail: userEmail,
      targetEmail: targetEmail,
    };
   

    if (index !== undefined) {
      payload.pathIndex = index;
    }

    const start = performance.now();
    const response = await axios.post('https://neo.coryfi.com/api/v1/getpathranking', payload);
    console.log("getPathRanking response time:", performance.now() - start, "ms");
try {
  const updatedUser = await db.user.update({
    where: {
      email: userEmail
    },
    data: {
      findPaths: {
        increment: 1
      }
    }
  })
  console.log("Updated user findPaths:", updatedUser.findPaths)
} catch (error: any) {
  console.error("Failed to update findPaths:", error.message)
}

    return response.data;
  } catch (error) {
    console.error("Error fetching path ranking:", error);
    return null;
  }
}

export async function getPathsData(userEmail:string){
  try {
    const user=await db.user.findFirst({
      where:{
        email:userEmail
      }
    })
    return user
    
  } catch (error) {
    return error
    
  }
}
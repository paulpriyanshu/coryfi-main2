// app/actions/pathActions.ts
'use server'

import axios from 'axios';

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
export async function getPathRanking(index: number, userEmail: string, targetEmail: string) {
  try {
    const response = await axios.post('https://neo.coryfi.com/api/v1/getpathranking', {
      sourceEmail: userEmail,
      targetEmail: targetEmail,
      pathIndex: index
    });

    const data = response.data;
    console.log("this is network data",data);
    return data;
  } catch (error) {
    console.error("Error fetching path ranking:", error);
    return null;
  }
}
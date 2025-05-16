import { NextRequest } from "next/server";
import db from "@/db"

export async function GET(req:NextRequest,{params}){
    const id=params.postId
     try {
        const data = await db.post.findUnique({
          where: { id },
          select: {
            id: true,
            content: true,
            likes:true,
            createdAt: true,
            updatedAt: true,
            imageUrl:true,
            user: {
              select: {
                id: true,
                userdp: true,
                email: true,  // You can add more user fields here
                name: true,
                // Add more fields as per your requirements
              },
            },
          },
        });
    
        // Return null if no data is found
        if (!data) {
          return null;
        }
    
        return data;
      } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Could not fetch post data");
      }
}
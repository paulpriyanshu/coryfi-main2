import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const id = parseInt(params.postId);
  console.log("post id",id)
  console.log("hello")

  try {
    const data = await db.post.findFirst({
      where: { id },
      select: {
        id: true,
        content: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
        user: {
          select: {
            id: true,
            userdp: true,
            email: true,
            name: true,
          },
        },
      },
    });
    console.log("post data",data)
    if (!data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
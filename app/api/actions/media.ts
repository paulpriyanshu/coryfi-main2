'use server'

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import db from "@/db"


const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
})


const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalName.substring(originalName.lastIndexOf('.'))
  return `${timestamp}-${randomString}${fileExtension}`
}

const getImageUrl = (key: string) => {
  return `https://gezeno.s3.eu-north-1.amazonaws.com/${key}`
}

export const getUnconnectedUsers = async (email: string) => {
  try {
    if (!email) {
      throw new Error("Email is required")
    }

    const currentUser = await db.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (!currentUser) {
      throw new Error("User not found")
    }

    // Get users who are not connected with the current user
    const users = await db.user.findMany({
      where: {
        AND: [
          { email: { not: email } },
          {
            NOT: {
              OR: [
                { 
                  connectionsReceived: {
                    some: {
                      AND: [
                        { requesterId: currentUser.id },
                        { status: "APPROVED" }
                      ]
                    }
                  }
                },
                {
                  connections: {
                    some: {
                      AND: [
                        { recipientId: currentUser.id },
                        { status: "APPROVED" }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        userdp: true
      }
    })
    
    console.log("unconnected users", users)
    return users
  } catch (error) {
    console.error("Error fetching unconnected users:", error)
    throw new Error("Failed to fetch unconnected users")
  }
}
export const getUrl = async (filename: string) => {
  try {
    if (!filename) {
      throw new Error("Filename is required")
    }

    const uniqueFilename = generateUniqueFilename(filename)
    const key = `images/${uniqueFilename}`

    const command = new PutObjectCommand({
      Bucket: "gezeno",
      Key: key,
      ContentType: "image/jpeg" // You might want to make this dynamic based on the file type
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return { url, filename: uniqueFilename }
  } catch (error) {
    console.error("Error generating signed upload URL:", error)
    throw new Error("Failed to generate signed upload URL")
  }
}

export const getImage = async (filename: string) => {
  try {
    if (!filename) {
      throw new Error("Filename is required")
    }
    const url = getImageUrl(`images/${filename}`)
    return { url }
  } catch (error) {
    console.error("Error generating direct URL:", error)
    throw new Error("Failed to generate direct URL")
  }
}

export const fetchUserData=async(userId)=>{
  const user=await db.user.findFirst({
    where:{
      id:userId
    }
    
  })
  return user

}
export const fetchUserId=async(email:string)=>{
    const user=await db.user.findFirst({
        where:{
            email
        }
    })
    return user


  }
export const fetchUserInfo=async(email?:string,id?:number)=>{
  if (id) {
    const user=await db.userDetails.findUnique({
      where:{
        id
      }
    })
    return user
  } else {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        userDetails: true, // Include UserDetails in the result
      },
    });
    return user
  }
  
}

  export const uploadPost = async ({ userId, content, imageUrl, videoUrl }: { 
    userId: number;
    content?: string | null;
    imageUrl?: string[] | null; // Array of image URLs
    videoUrl?: string[] | null; // Array of video URLs
  }) => {
    try {
      // Check if both imageUrl and videoUrl are not provided
      if (!imageUrl && !videoUrl) {
        throw new Error('No Media provided');
      }
  
      // Ensure imageUrl and videoUrl are arrays if not null
      // const imageUrls = Array.isArray(imageUrl) ? imageUrl : [];
      // const videoUrls = Array.isArray(videoUrl) ? videoUrl : [];
  
      // Create the new post with the provided data
      console.log(imageUrl)
      const newPost = await db.post.create({
        data: {
          userId,
          content,
          imageUrl, // Default to empty array if no image URL is provided
          videoUrl, // Default to empty array if no video URL is provided
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
  
      console.log('New Post Created:', newPost);
      return newPost;
      
    } catch (error) {
      console.error("Error uploading post:", error);
      throw error;
    }
  };
  export const fetchImages = async () => {
    // Fetch post data with related user and comment data
    const data = await db.post.findMany({
      include: {
        user: {
          select: {
            id: true, // Fetch the user ID
            name: true, // Fetch the user name
            email: true, // Fetch the user email
            userdp: true, // Fetch the user profile picture
          },
        },
        comments: {
          select: {
            id: true, // Comment ID
            content: true, // Comment content
            createdAt: true, // When the comment was created
            user: { // Assuming you want user info for the comment
              select: {
                id: true,
                name: true,
                userdp: true,
              },
            },
          },
        },
      },
    });
  
    // Fisher-Yates shuffle algorithm to randomize the posts
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]]; // Swap elements
    }
  
    // Return the randomized data
    return data;
  };

export const fetchPosts = async (userId: any) => {
  const posts = await db.post.findMany({
    where: {
      userId,
    },
    select: {
      id:true,
      content: true,
      imageUrl: true,
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  // Count non-null `content`, `imageUrl`, and comments
  const totalContent = posts.filter((post) => post.content !== null).length;
  const totalImageUrls = posts.filter((post) => post.imageUrl.length > 0).length;
  const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);

  return {
    posts,
    totalContent,
    totalImageUrls,
    totalComments,
  };
};

export const fetchOnlyPost=async(id:number)=>{
  const data=await db.post.findUnique({
    where:{
      id
    }
  })
  return data

}


export const likePost=async(id:number,viewerEmail:string)=>{
     await db.post.update({
    where: { id },
    data: {
      likes: {
        push: viewerEmail, // Prisma's `push` adds to a `text[]` field
      },
    },
  });


}
export const dislikePost = async (id: number, viewerEmail: string) => {
  // Fetch the current likes array for the post
  const post = await db.post.findUnique({
    where: { id },
    select: { likes: true },
  });

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  // Filter out the email from the likes array
  const updatedLikes = post.likes.filter((email: string) => email !== viewerEmail);

  // Update the post with the new likes array
  await db.post.update({
    where: { id },
    data: {
      likes: updatedLikes, // Replace the old likes array with the filtered one
    },
  });
};

export const getLikesCount = async (id: number): Promise<number> => {
  const post = await db.post.findUnique({
    where: { id },
    select: { likes: true },
  });

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  return post.likes.length;
};



// Function to post a comment on a post
export async function createComment(
  postId: number, 
  userId: number, 
  content: string, 
  parentId?: number
) {
  try {
    // Ensure all necessary data is provided
    if (!postId || !userId || !content) {
      throw new Error('Post ID, user ID, and content are required.');
    }

    // Create a comment or a reply
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId: parentId || null, // Set parentId to null for top-level comments
      },
    });

    return { success: true, comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message };
  }
}

// Function to reply to a comment
export async function replyToComment(
  postId: number,
  userId: number,
  content: string,
  parentId: number
) {
  try {
    // Ensure all necessary data is provided
    if (!postId || !userId || !content || !parentId) {
      throw new Error('Post ID, user ID, content, and parent comment ID are required.');
    }

    // Create a reply to the comment
    const reply = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId, // Reference the parent comment ID for this reply
      },
    });

    return { success: true, reply };
  } catch (error) {
    console.error('Error replying to comment:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchCommentsWithReplies(postId: number) {
  try {
    // Ensure postId is provided
    if (!postId) {
      throw new Error('postId is required.');
    }

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, // Only top-level comments
      include: {
        user: true, // Include user details for each comment (if needed)
        replies: {
          include: {
            user: true,
            replies: {
              include: {
                user: true,
                replies: {
                  include: {
                    user: true,
                    replies: {
                      include: {
                        user: true,
                        replies: {
                          include: {
                            user: true,
                            replies: {
                              include: {
                                user: true,
                                replies: {
                                  include: {
                                    user: true,
                                    replies: {
                                      include: {
                                        user: true,
                                        replies: {
                                          include: {
                                            user: true,
                                            replies: {
                                              include: {
                                                user: true,
                                                replies: {
                                                  include: {
                                                    user: true,
                                                    replies: {
                                                      include: {
                                                        user: true,
                                                        replies: {
                                                          include: {
                                                            user: true,
                                                            replies: {
                                                              include: {
                                                                user: true,
                                                                replies: {
                                                                  include: {
                                                                    user: true,
                                                                    replies: {
                                                                      include: {
                                                                        user: true,
                                                                        replies: {
                                                                          include: {
                                                                            user: true,
                                                                            replies: {
                                                                              include: {
                                                                                user: true,
                                                                                replies: {
                                                                                  include: {
                                                                                    user: true,
                                                                                    replies: {
                                                                                      include: {
                                                                                        user: true,
                                                                                        replies: {
                                                                                          include: {
                                                                                            user: true,
                                                                                            replies: {
                                                                                              include: {
                                                                                                user: true,
                                                                                                replies: {
                                                                                                  include: {
                                                                                                    user: true,
                                                                                                  },
                                                                                                },
                                                                                              },
                                                                                            },
                                                                                          },
                                                                                        },
                                                                                      },
                                                                                    },
                                                                                  },
                                                                                },
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
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
        createdAt: 'asc', // Sort comments by creation time
      },
    });

    return { success: true, comments };
  } catch (error) {
    console.error('Error fetching comments with replies:', error);
    return { success: false, error: error.message };
  }
}
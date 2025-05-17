import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"


export const runtime = "edge" // Change to edge runtime for better performance with OG images

export async function GET(request: NextRequest, { params }: { params: { postId: number } }) {
  try {
    const { postId } = params

    // Get the host from headers to build absolute URLs that work in both dev and production
    // const headersList = headers()
    // const host = headersList.get("host") || "localhost:3000"
    // const protocol = host.includes("localhost") ? "http" : "https"

    // Use absolute URL that works in both development and production
    const res = await fetch(`https://connect.coryfi.com/api/post-data/${postId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch post data: ${res.status}`)
    }

    const post = await res.json()
    


    // If post doesn't exist, return a default OG image
    if (!post) {
      return new ImageResponse(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a1a",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: "bold", color: "#fff" }}>Coryfi Connect</div>
          <div style={{ fontSize: 30, color: "#ccc", marginTop: 20 }}>Post not found</div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    }

    // Check if the post has images
    if (post.imageUrl && post.imageUrl.length > 0) {
      // Use the first image from the post
    //   const imageUrl = post.imageUrl[0]
       const imageUrl = post?.imageUrl[0] 
      ? new URL(post.imageUrl[0], 'https://connect.coryfi.com').toString()
      : 'https://connect.coryfi.com/placeholder.jpg'

      // Create an OG image with the post's first image and overlay text
      return new ImageResponse(
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: "#000",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden", // Prevent image overflow
          }}
        >
          {/* Background image with overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={post.title || "Post image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                zIndex: -1,
              }}
            />
            {/* Dark overlay for better text readability */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 0,
              }}
            />
          </div>

          {/* Content overlay */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              maxWidth: "80%",
              textAlign: "center",
              zIndex: 1, // Ensure content is above the background
            }}
          >
            {post.title && (
              <div
                style={{
                  fontSize: 72,
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: 20,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {post.title.length > 60 ? `${post.title.substring(0, 57)}...` : post.title}
              </div>
            )}

            {/* User info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              {post.user?.userdp && (
                <img
                  src={post.user.userdp || "/placeholder.svg"}
                  alt={post.user.name || "User"}
                  width={60}
                  height={60}
                  style={{ borderRadius: "50%", marginRight: 15 }}
                />
              )}
              <div
                style={{
                  fontSize: 36,
                  color: "#fff",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {post.user?.name || "Coryfi Connect User"}
              </div>
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              right: 30,
              fontSize: 28,
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Coryfi Connect
          </div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    } else {
      // For text-only posts, create a designed template with the content
      // Extract text content from HTML if needed
      const textContent = post.content
        ? post.content.replace(/<[^>]*>/g, "").substring(0, 280)
        : "View this post on Coryfi Connect"

      const title = post.title || "Coryfi Connect Post"

      // Generate a gradient background based on the post ID for variety
      const hue = (postId * 137.5) % 360
      const gradient = `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 60) % 360}, 80%, 50%))`

      return new ImageResponse(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: gradient,
            padding: "60px",
            fontFamily: "sans-serif",
            color: "white",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderRadius: "16px",
              padding: "40px",
              width: "90%",
              height: "80%",
            }}
          >
            <div style={{ fontSize: 72, fontWeight: "bold", marginBottom: 30 }}>
              {title.length > 60 ? `${title.substring(0, 57)}...` : title}
            </div>

            <div style={{ fontSize: 36, lineHeight: 1.4, maxWidth: "90%" }}>
              "{textContent.length > 140 ? `${textContent.substring(0, 137)}...` : textContent}"
            </div>

            {/* User info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "auto",
              }}
            >
              {post.user?.userdp && (
                <img
                  src={post.user.userdp || "/placeholder.svg"}
                  alt={post.user.name || "User"}
                  width={60}
                  height={60}
                  style={{ borderRadius: "50%", marginRight: 15 }}
                />
              )}
              <div style={{ fontSize: 36 }}>{post.user?.name || "Coryfi Connect User"}</div>
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              right: 30,
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            Coryfi Connect
          </div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    }
  } catch (error) {
    console.error("Error generating OG image:", error)

    // Fallback image in case of error
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          padding: "40px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: "bold", color: "#fff" }}>Coryfi Connect</div>
        <div style={{ fontSize: 30, color: "#ccc", marginTop: 20 }}>Share and connect with others</div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }
}

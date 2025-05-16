import { Suspense } from "react"
import { fetchOnlyPost } from "@/app/api/actions/media"
import PostDetail from "./post-detail"
import type { Metadata, ResolvingMetadata } from "next"
import { fetchEdgeOnlyPost } from "@/app/api/edge/post"

// This is a server component that handles metadata and initial data fetching
export const dynamic = "force-dynamic"
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Fetch post data for metadata
  const id= Number(params.id)
  const post = await fetchOnlyPost(Number(id))

  // Fallback values if post isn't found
  const title =
  post?.title || post?.content?.slice(0, 50)?.replace(/<[^>]*>/g, "") || "Post on Coryfi"
  const description = post?.content
    ? post.content.replace(/<[^>]*>/g, "").substring(0, 160)
    : "View this post on Coryfi Connect"

  // Use the dynamic OG image route instead of a static image
  const ogImageUrl = `https://connect.coryfi.com/api/post-og/${id}`

  return {
    title: `${title} | Coryfi Connect`,
    description,
    openGraph: {
      title: `${title} | Coryfi Connect`,
      description,
      images: [
        {
          url: `https://connect.coryfi.com/api/post-og/${id}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      authors: post?.user?.name ? [post.user.name] : undefined,
      url: `https://connect.coryfi.com/p/${id}`,
      siteName: "Coryfi Connect",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Coryfi Connect`,
      description,
      images: [`https://connect.coryfi.com/api/post-og/${id}`],
      creator: post?.user?.name ? `@${post.user.name.replace(/\s+/g, "")}` : "@coryficonnect",
    },
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  // Pre-fetch the post data on the server
  const id = params.id
  const initialPost = await fetchOnlyPost(Number(id))

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PostDetail initialPost={initialPost} postId={id} />
    </Suspense>
  )
}

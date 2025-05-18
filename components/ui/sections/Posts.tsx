import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import PostActions from "./PostActions";
import ImageCarousel from "./ImageCarousel";
import ClickablePostWrapper from "./ClickablePostWrapper";
import { ShowMoreButton } from "./ShowMoreButton";

interface PostProps {
  post: {
    id: string;
    content: string;
    imageUrl?: string[];
    videoUrl?: string[];
    likes: string[];
    comments: any[];
    createdAt: string;
    user: {
      id: string;
      name: string;
      userdp: string;
    };
  };
  session: any;
  userId: { id: string };
}

export default function Posts({ post, session, userId }: PostProps) {
  const MAX_LENGTH = 200;
  const isLongContent = post.content.length > MAX_LENGTH;
  const displayedContent = post.content.substring(0, MAX_LENGTH);

  const makeLinksClickable = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    return text.replace(urlRegex, (url) => {
      const cleanedUrl = url.replace(/[.,!?;]$/, "");
      return `<a href="${cleanedUrl}" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">${cleanedUrl}</a>`;
    });
  };

  const postContent = (
    <>
      <div className="mb-2 p-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <Link href={`/userProfile/${post?.user?.id}`}>
              <AvatarImage src={post?.user?.userdp} alt={post.user?.name} />
            </Link>
            <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/userProfile/${post?.user?.id}`}>
              <h3 className="text-black dark:text-white font-semibold hover:underline hover:cursor-pointer">
                {post?.user?.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post?.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-2">
        <div className="prose dark:prose-invert max-w-full">
          <div
            dangerouslySetInnerHTML={{
              __html: makeLinksClickable(displayedContent),
            }}
          />
          {isLongContent && <ShowMoreButton />}
        </div>

        {(post.imageUrl?.length > 0 || post.videoUrl?.length > 0) && (
          <ImageCarousel images={post.imageUrl} videos={post.videoUrl} />
        )}
      </div>

      <PostActions post={post} session={session} userId={userId} />
    </>
  );

  return (
    <ClickablePostWrapper post={post} userId={userId}>
      {postContent}
    </ClickablePostWrapper>
  );
}
"use client";
import React from "react";
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PostModal from "./PostModal";
import toast from "react-hot-toast";


  const handleShare = async (e, postId) => {
    e.stopPropagation(); // Prevent post modal from opening
    const url = `https://connect.coryfi.com/p/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard', {
        duration: 2000,
        style: {
          background: '#4CAF50',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link', {
        duration: 2000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

function Posts({ post, session, handleLike,userId }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleOpenModal = () => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div>
      <Card
        className="bg-white shadow-lg cursor-pointer my-2 p-0"
        onClick={handleOpenModal}
      >
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={post?.user?.userdp}
                alt={post.user?.name}
                onClick={() => router.push(`/userProfile/${post?.user?.id}`)}
              />
              <AvatarFallback
                onClick={() => router.push(`/userProfile/${post?.user?.id}`)}
              >
                {post.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div onClick={() => router.push(`/userProfile/${post?.user?.id}`)}>
                <CardTitle className="text-black hover:underline hover:cursor-pointer">
                  {post?.user?.name}
                </CardTitle>
              </div>
              <p className="text-sm text-black">
                {new Date(post?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {(post.imageUrl?.length > 0 || post.videoUrl?.length > 0) && (
            <Carousel className="w-full">
              <CarouselContent>
                {post.imageUrl?.map((url, idx) => (
                  <CarouselItem key={`image-${idx}`}>
                    <div className="relative w-full h-[500px]">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Post content ${idx + 1}`}
                        className="rounded-lg w-full h-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {(post.imageUrl?.length + (post.videoUrl?.length || 0)) > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={`hover:text-black hover:bg-slate-500 ${
              post.likes.includes(session?.user?.email)
                ? "text-black"
                : "text-gray-600"
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering
              handleLike(post.id); // Call the like handler
            }}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {post.likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black hover:bg-slate-500"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {post.comments?.length || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black hover:bg-slate-500"
            onClick={(e) => handleShare(e,post.id)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </CardFooter>
       
      </Card>

      {selectedPost && (

            <PostModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            post={selectedPost}
            userId={userId}
            />
)}

    </div>
      
      
      

  );
}

export default Posts;
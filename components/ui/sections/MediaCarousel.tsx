import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"




export const MediaCarousel= ({ post }) => {
  const hasMultipleMedia = (post.imageUrl?.length || 0) + (post.videoUrl?.length || 0) > 1

  return (
    <Carousel className="w-full h-full">
      <CarouselContent>
        {post.imageUrl?.map((url, index) => (
          <CarouselItem key={`image-${index}`} className="h-full">
            <div className="h-full w-full flex items-center justify-center bg-black">
              <img
                src={url}
                alt={`Post image ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </CarouselItem>
        ))}
        {post.videoUrl?.map((url, index) => (
          <CarouselItem key={`video-${index}`} className="h-full">
            <div className="h-full w-full flex items-center justify-center bg-black">
              <video
                src={url}
                controls
                className="max-h-full max-w-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {hasMultipleMedia && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  )
}


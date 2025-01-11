import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Post } from './types'

export const MediaCarousel = ({ post }: { post: Post }) => (
  <Carousel className="w-full h-full">
    <CarouselContent>
      {post.imageUrl.map((url, index) => (
        <CarouselItem key={`image-${index}`}>
          <img
            src={url}
            alt={`Post image ${index + 1}`}
            className="h-full w-full object-contain"
          />
        </CarouselItem>
      ))}
      {post.videoUrl?.map((url, index) => (
        <CarouselItem key={`video-${index}`}>
          <video
            src={url}
            controls
            className="h-full w-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </CarouselItem>
      ))}
    </CarouselContent>
    {(post.imageUrl.length > 1 || (post.videoUrl && post.videoUrl.length > 0)) && (
      <>
        <CarouselPrevious />
        <CarouselNext />
      </>
    )}
  </Carousel>
)


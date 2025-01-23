// import React from 'react'
// import { fetchImages } from '@/app/api/actions/media'
// import { MessageSquare, ThumbsUp, Share2} from 'lucide-react'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel"
// import ModernUserCarousel from "@/components/ui/sections/ModernUserCarousel"
// import Posts from './Posts'


// async function FeedPosts() {
//     const posts=await fetchImages()

//   return (
//     <div>
//            {posts.map((post, index) => (
//           <React.Fragment key={post._id || index}>
//             <Posts key={post.id} post={post} session={session} handleLike={handleLike}/>

//             {/* Render the ModernUserCarousel after every 5 posts */}
            // {(index + 1) % 3 === 0 && (
            //   <div className="md:hidden">
            //     <ModernUserCarousel userEmail={Email ? Email : null} />
            //   </div>
            // )}
//           </React.Fragment>
//         ))}

//     </div>
//   )
// }

// export default FeedPosts
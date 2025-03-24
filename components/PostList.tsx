import React from "react"
import Posts from "@/components/ui/sections/Posts"
import ModernUserCarousel from "./ui/sections/ModernUserCarousel"

export default function PostList({ initialPosts, session, userId }) {


  return (
    <div>
      {<div className="md:hidden"> 
        <ModernUserCarousel userEmail={session?.user?.email ? session?.user?.email : null}/>
        </div>
        
      }
      {initialPosts?.map((post) => (
        <div key={post.id}>
          <Posts post={post} session={session} userId={userId}  />
        </div>
      ))}
      {/* {<div className="md:hidden"> 
        <ModernUserCarousel userEmail={session?.user?.email ? session?.user?.email : null}/>
        </div>
        
      } */}
    </div>
  )
}
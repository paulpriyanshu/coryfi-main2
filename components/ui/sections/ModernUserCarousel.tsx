'use client'

import React, { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUnconnectedUsers } from '@/app/api/actions/media'



const ModernUserCarousel= ({userEmail}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [users,setUsers]=useState(null)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])
  const router=useRouter()
  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

   useEffect(()=>{

      // console.log("prop email",userEmail)
      const fetchUnconnectedUsers=async()=>{
  
         if (userEmail) {
           const data=await getUnconnectedUsers(userEmail)
          //  console.log("unconnected people",data)
           setUsers(data)
         } 
      }
      fetchUnconnectedUsers()
     },[])
     
     
     if(!userEmail || !users){
      return null
     }
  return (
    <div className="relative w-5/6 max-w-sm m-5">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {users?.map((user) => (
            <div key={user.id} className="flex-[0_0_100%] min-w-0 pl-4 relative">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.userdp} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-black">{user.name}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/userProfile/${user.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/users`)}
                    >
                      Show More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md"
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ModernUserCarousel


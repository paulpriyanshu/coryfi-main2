import React from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

function FeedRightSideBarButton({user}) {
    const router=useRouter()
  return (
      <div>
            <p className="font-bold text-black cursor-pointer" onClick={()=>router.push('/profile')}>{user ? user?.name : null}</p>
            <Button variant="link" className="text-black p-0 h-auto" onClick={()=>router.push('/settings/profile')}>Edit Profile</Button>
        </div>
  )
}

export default FeedRightSideBarButton
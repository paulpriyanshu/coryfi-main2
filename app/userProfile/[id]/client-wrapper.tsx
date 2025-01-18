'use client'

import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RatingModal } from '@/components/ui/sections/RatingModal'
import { connect_users } from "@/app/api/actions/network"
import toast from 'react-hot-toast'
import { useAppSelector } from '@/app/libs/store/hooks'
import { selectResponseData } from '@/app/libs/features/pathdata/pathSlice'

export function ClientWrapper({ userId, isConnected: initialIsConnected, userData, session }) {
  const [isConnected, setIsConnected] = useState(initialIsConnected)
  const [connectionStatus, setConnectionStatus] = useState(initialIsConnected ? 'Connected' : 'Connect')
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const router = useRouter()
  const pathData = useAppSelector(selectResponseData)

  const handleConnectClick = () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to connect with other users")
      return
    }
    if (!isConnected) {
      setIsRatingModalOpen(true)
    }
  }

  const handleRatingSubmit = async (rating: number) => {
    if (!session?.user?.email || !userData?.email) {
      toast.error("Unable to establish connection. Please try again.")
      return
    }

    setConnectionStatus('Connecting')
    
    const connectPromise = connect_users(
      session.user.email,
      session?.user?.name,
      userData.email,
      rating
    )
    
    toast.promise(connectPromise, {
      loading: 'Connecting...',
      success: (data) => {
        setConnectionStatus('Connected')
        setIsConnected(true)
        return `Request sent to ${userData.name}!`
      },
      error: (err) => {
        setConnectionStatus('Connect')
        return "Unable to establish connection. Please try again."
      },
    })
  }

  const goToChat = (id) => {
    router.push(`/?tab=chats&expand=true&id=${id}`)
  }

  const handleFindPath = () => {
    router.push('/?tab=results&expand=true')
    toast.success('Redirecting to Find Path...')
  }

  return (
    <div className="flex space-x-2">
      <Button 
        className="bg-white hover:bg-slate-500 text-black transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={handleFindPath}
        disabled={connectionStatus === 'Connecting' || isConnected || pathData?.path?.length === 0}
      >
        <img src='/icon.png' className="mr-2 h-6 w-6" alt="Path icon" />
        <span className='hidden md:block'>Find Path</span>
      </Button>
      
      <Button 
        className={`transition-all duration-300 ease-in-out transform hover:scale-105
          ${isConnected 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-white hover:bg-slate-500 text-black hover:text-white'}`}
        onClick={handleConnectClick}
        disabled={connectionStatus === 'Connecting' || isConnected}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="outline"
        className="transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={() => goToChat(userId)}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        <span className="hidden md:block">Message</span>
      </Button>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  )
}
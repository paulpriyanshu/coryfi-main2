import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight } from 'lucide-react'
import { createConnectionRequest, intermediaryUserList, startEvaluation } from '@/app/api/actions/network'
import { useSession } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setResponseData } from '@/app/libs/features/pathdata/pathSlice'

type PathNode = {
  id: number
  email: string
  name: string
  bio: string
  connections: number
  group: number
  visible: boolean
}

type ConnectionPath = {
  nodes: PathNode[]
  links: { source: number; target: number; value: number }[]
}

interface CollaborativeEvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  path: ConnectionPath
}

export default function CollaborativeEvaluationModal({ isOpen, onClose, path }) {
  const [evaluationId, setEvaluationId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session, status } = useSession()
  const dispatch=useDispatch()
  const router=useRouter()

const handleConfirm = async () => {
  setIsProcessing(true)
  try {
    const data = await createConnectionRequest(
      path.nodes[0].email,
      path.nodes[1].email,
      path.nodes.slice(3)
    )
    await intermediaryUserList(path.nodes.slice(3))
    setEvaluationId(data?.evaluationId)
    console.log("data while starting path",data)
    let currentUserId = data.chatDetails.participants.filter(
      (p) => p._id === data.chatDetails.admin
    )
    let recieverId = data.chatDetails.participants.filter(
      (p) => p._id !== data.chatDetails.admin
    )

    toast.success('Path has started! Go to chat section', {
      icon: '🚀',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
    console.log("starting path",path)
    await startEvaluation(path?.nodes)


    onClose()
    dispatch(setResponseData(path))

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (isMobile) {
      router.push(
        `/c/${data.chatDetails._id}/?id=${currentUserId[0]._id}&rid=${recieverId[0]._id}`
      )
    } else {
      router.push(
        `/?tab=chats&expand=true&cid=${data.chatDetails._id}&id=${currentUserId[0]._id}&rid=${recieverId[0]._id}`
      )
    }
  } catch (error) {
    console.error("Error starting collaborative evaluation:", error)
    toast.error('Failed to start collaborative evaluation. Please try again.')
  } finally {
    setIsProcessing(false)
  }
}
 
  const updatedPath = path.nodes.slice(2)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Path</DialogTitle>
            <DialogDescription>
              Are you sure you want to start with the following path?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between">
              {updatedPath.map((node, index) => (
                <div key={node.id} className="flex flex-col items-center">
                  <Avatar className="w-12 h-12 mb-2">
                    <AvatarImage src={node.userdp ||`https://api.dicebear.com/6.x/initials/svg?seed=${node.name}`} alt={node.name} />
                    <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center">{node.name}</span>
                  {index < updatedPath.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? 'Starting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster position="top-right" />
    </>
  )
}


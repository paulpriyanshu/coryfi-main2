"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch } from '@/app/libs/store/hooks'
import { setResponseData } from '@/app/libs/features/pathdata/pathSlice'
import CollaborativeEvaluationModal from './CollaborativeEvaluationModal'
import ConnectionPathCard from './ConnectionPathCard'
import { fetchUserDp } from '@/app/api/actions/media'
import { useRouter } from 'next/navigation'
import { View } from 'lucide-react'

// Function to fetch user display picture
// export const fetchUserDp = async (email: string) => {
//   const user = await db.user.findFirst({
//     where: { email }
//   })
//   return user?.profilePicture || null // Assuming profilePicture is the field for display picture
// }

export default function ResultCard({ index, path }: { index: number; path }) {
  const dispatch = useAppDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userDisplayPictures, setUserDisplayPictures] = useState<{[email: string]: string}>({})
  const router=useRouter()

  // Fetch display pictures for all nodes
  useEffect(() => {
    const fetchDisplayPictures = async () => {
       const emails = path.nodes.map((node) => node.email)
       const dpResults=await fetchUserDp(emails)

      // const dpPromises = path.nodes.map(async (node) => {
      //   const dp = await fetchUserDp(node.email)
      //   console.log("user dp",dp)
      //   return { email: node.email, dp }
      // })

      // const dpResults = await Promise.all(dpPromises)
      console.log("user dps",dpResults)
      
      const dpMap = dpResults.reduce((acc, result) => {
        if (result.userdp) {
          acc[result.email] = result.userdp
        }
        return acc
      }, {})

      setUserDisplayPictures(dpMap)
    }

    fetchDisplayPictures()
  }, [path])

  const handlePathClick = () => {
    dispatch(setResponseData(path))
    router.replace("/")
  }

  const handleCollaborativeEvaluation = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(true)
   
    
    
  }
useEffect(()=>{
  console.log("dp arrays",userDisplayPictures)
})
  const lastNode = path.nodes[path?.nodes?.length - 1];
  return (
    <>
      <Card 
        className="bg-background/50 hover:bg-background/80 transition-colors duration-200 hover:cursor-pointer hover:bg-slate-100 dark:bg-slate-900 dark:text-white"
        onClick={handlePathClick}
      >
        <CardContent className="p-4  dark:text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={
                  userDisplayPictures[lastNode.email] || 
                  `https://api.dicebear.com/6.x/initials/svg?seed=${lastNode.name}`
                } 
                alt={lastNode.name} 
              />
              <AvatarFallback>{lastNode.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-semibold text-sm">{lastNode.name}</h3>
              <p className="text-xs text-muted-foreground">Connected through {path.nodes.length - 2} people</p>
            </div>
             <Button 
              onClick={handlePathClick}
              className="ml-auto"
              variant="outline"
              size="sm"
            >
              {/* <img src='/icon.png' className="w-5 h-5" />
               */}
               <View className='w-5 h-5'/>
              <div className='font-sans text-slate-700  dark:text-white'>View</div>
            </Button>
            <Button 
            onClick={handleCollaborativeEvaluation}
              className="ml-auto"
              variant="outline"
              size="sm"
            >
              <img src='/icon.png' className="w-5 h-5" />
              <div className='font-sans text-extrabold text-slate-700  dark:text-white'>Start</div>
            </Button>
          </div>
          <ConnectionPathCard 
            path={{
              ...path, 
              nodes: path.nodes.map(node => ({
                ...node,
                profilePicture: userDisplayPictures[node.email] || 
                  `https://api.dicebear.com/6.x/initials/svg?seed=${node.name}`
              }))
            }} 
          />
        </CardContent>
      </Card>
      <CollaborativeEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        path={path}
      />
    </>
  )
}
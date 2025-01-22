"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch } from '@/app/libs/store/hooks'
import { setResponseData } from '@/app/libs/features/pathdata/pathSlice'
import CollaborativeEvaluationModal from './CollaborativeEvaluationModal'
import ConnectionPathCard from './ConnectionPathCard'

export default function ResultCard({ index, path }: { index: number; path }) {
    const dispatch = useAppDispatch()
    const [isModalOpen, setIsModalOpen] = useState(false)
  
    const handlePathClick = () => {
      // console.log("Dispatching path:", path)
      dispatch(setResponseData(path))
    }
  
    const handleCollaborativeEvaluation = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent card click event
      setIsModalOpen(true)
    }
  
    const lastNode = path.nodes[path?.nodes?.length - 1];
    return (
      <>
        <Card 
          className="bg-background/50 hover:bg-background/80 transition-colors duration-200 hover:cursor-pointer hover:bg-slate-100"
          onClick={handlePathClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${lastNode.name}`} alt={lastNode.name} />
                <AvatarFallback>{lastNode.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-semibold text-sm">{lastNode.name}</h3>
                <p className="text-xs text-muted-foreground">Connected through {path.nodes.length - 2} people</p>
              </div>
              <Button 
                onClick={handleCollaborativeEvaluation}
                className="ml-auto"
                variant="outline"
                size="sm"
              >
                <img src='/icon.png' className="w-5 h-5" />
                <div className='font-sans text-extrabold text-slate-700'>Start</div>
              </Button>
            </div>
            <ConnectionPathCard path={path} />
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
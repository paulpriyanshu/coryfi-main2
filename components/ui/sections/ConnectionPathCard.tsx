'use client'

import { ArrowUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
export default function ConnectionPathCard({ path }) {
    const nodesToShow = path.nodes.length > 5 ? [...path.nodes.slice(2,5), '...', path.nodes[path.nodes.length - 1]] : path.nodes.slice(2,path.nodes.length);
    const hasEllipsis = path.nodes.length > 5;
    // console.log("nodes before show",path?.nodes)
    console.log("nodes to show",nodesToShow)
    return (
      <TooltipProvider>
        <div className="relative py-6">
          <div className="flex items-center justify-between">
            {nodesToShow.map((node, index) => (
              node === '...' ? (
                <div key="ellipsis" className="text-gray-500">...</div> 
              ) : (
                <Tooltip key={node.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center relative">
                      <Avatar className={`w-12 h-12 relative z-10 ${index === 1 ? 'ring-4 ring-black/50 ring-offset-2' : ''}`}>
                        <AvatarImage src={ node.profilePicture} alt={node.name} />
                        <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {index === 1 && (
                        <div className="absolute -bottom-7">
                          <ArrowUp className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.email}</p>
                  </TooltipContent>
                  <div className={`absolute top-1/2 left-0 right-0 h-0.5 ${hasEllipsis ? 'bg-transparent' : 'bg-black/50'} -translate-y-1/2 z-0`}>
            {hasEllipsis && (
              <div className="absolute left-1/3 right-1/3 border-t border-dashed border-gray-500" />
            )}
          </div>
                  
                </Tooltip>
              )
            ))}
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/50 -translate-y-1/2 z-0"></div>
        </div>
      </TooltipProvider>
    )
  }
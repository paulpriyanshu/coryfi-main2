'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import axios from 'axios'
import { getUnconnectedUsers } from "@/app/api/actions/media"

import { useRouter } from "next/navigation"
import { useAppDispatch } from '@/app/libs/store/hooks'
import { setResponseData } from '@/app/libs/features/pathdata/pathSlice'

export default function LeftSidebar({ userEmail }) {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [path, setPath] = useState({})
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleFindPath = async (email: string) => {
    if (userEmail) {
      try {
        const response = await axios.post("https://neo.coryfi.com/api/v1/getpathranking", {
          targetEmail: email,
          sourceEmail: userEmail,
          pathIndex: 0
        })
        setPath(response.data.path)
        dispatch(setResponseData(response.data))
      } catch (error) {
        console.error('Error finding path:', error)
      }
    }
  }

  const handleUserRoute = async (id) => {
    router.push(`/userProfile/${id}`)
  }

  useEffect(() => {
    const fetchUnconnectedUsers = async () => {
      if (userEmail) {
        setLoading(true)
        try {
          const data = await getUnconnectedUsers(userEmail)
          setPeople(data)
        } catch (error) {
          console.error('Error fetching unconnected users:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchUnconnectedUsers()
  }, [userEmail])

  return (
    <Card className="bg-white shadow-lg sticky top-4">
      <CardContent className="p-6">
        <Tabs defaultValue="dms" className="w-full">
          <div className="flex justify-center h-full w-full font-bold text-slate-800 text-lg m-2">People You May Know</div>
          <div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              {loading ? (
                // Skeleton loader
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between mb-5 p-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-[60px]" />
                  </div>
                ))
              ) : (
                people?.map(person => (
                  <div key={person?.name} className="flex items-center justify-between mb-5 p-2 hover:bg-slate-500 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={person?.userdp} alt={person?.name} />
                        <AvatarFallback>{person?.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm text-black">{person?.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black border-black hover:bg-slate-500"
                      onClick={() => {
                        handleFindPath(person.email);
                        handleUserRoute(person.id);
                      }}
                    >
                      View 
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
          <div className="flex justify-center m-2" onClick={() => router.push('/users')}>
            <Button>
              Show More
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}


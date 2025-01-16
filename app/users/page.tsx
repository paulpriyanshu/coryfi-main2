'use client'

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/Input"
import { getAllUnconnectedUsers } from "@/app/api/actions/media"
import { useAppDispatch } from '@/app/libs/store/hooks'
import { setResponseData } from '@/app/libs/features/pathdata/pathSlice'

interface User {
  id: string
  name: string
  email: string
  userdp: string
}

export default function UnconnectedUsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const userEmail = session?.user?.email || ''

  useEffect(() => {
    const fetchUnconnectedUsers = async () => {
      if (userEmail) {
        const data = await getAllUnconnectedUsers(userEmail)
        console.log("unconnected people", data)
        setUsers(data)
      }
    }
    fetchUnconnectedUsers()
  }, [userEmail])

  const handleFindPath = async (email: string) => {
    if (userEmail) {
      try {
        const response = await axios.post("https://neo.coryfi.com/api/v1/getpathranking", {
          targetEmail: email,
          sourceEmail: userEmail,
          pathIndex: 0
        })
        console.log("this is the prop data", response.data)
        dispatch(setResponseData(response.data))
        console.log("this is connect data", response.data)
      } catch (error) {
        console.error('Error finding path:', error)
      }
    }
  }

  const handleUserRoute = async (id: string) => {
    router.push(`/userProfile/${id}`)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="bg-white shadow-lg m-4">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">People You May Know</h1>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between mb-4 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.userdp} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-sm text-black">{user.name}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-black border-black hover:bg-slate-200"
                onClick={() => {
                  handleFindPath(user.email);
                  handleUserRoute(user.id);
                }}
              >
                View
              </Button>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


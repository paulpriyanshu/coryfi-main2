'use client'


import React, { useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs } from "@/components/ui/tabs"

import axios from 'axios'
import {  getUnconnectedUsers } from "@/app/api/actions/media"

import { useRouter } from "next/navigation"
import { useAppDispatch } from '@/app/libs/store/hooks'
import {  setResponseData } from '@/app/libs/features/pathdata/pathSlice'
export default function LeftSidebar({userEmail}) {
    const [people,setPeople]=useState([])
    const [path,setPath]=useState({})
    const dispatch=useAppDispatch()
    
    const router=useRouter()
const handleFindPath = async (email: string) => {
        if (userEmail) {
          try {
            const response = await axios.post("https://neo.coryfi.com/api/v1/getpathranking", {
              targetEmail: email,
              sourceEmail: userEmail,
              pathIndex:0
            })
            setPath(response.data.path)
            // console.log("this is the prop data",response.data)
            dispatch(setResponseData(response.data))
            // console.log("this is connect data",response.data)
          } catch (error) {
            console.error('Error finding path:', error)
          }
        }
      }
    const handleUserRoute=async(id)=>{
        router.push(`/userProfile/${id}`)
      
      
      }
   
   useEffect(()=>{
    // console.log("prop people",people)
    // console.log("prop email",userEmail)
    const fetchUnconnectedUsers=async()=>{

       if (userEmail) {
         const data=await getUnconnectedUsers(userEmail)
        //  console.log("unconnected people",data)
         setPeople(data)
       } 
    }
    fetchUnconnectedUsers()
   },[])
    return (
    <Card className="bg-white shadow-lg sticky top-4">
    <CardContent className="p-6">
      <Tabs defaultValue="dms" className="w-full">
            <div className=" flex  justify-center h-full w-full font-bold text-slate-500 text-lg m-2">People You May Know</div>
        <div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {people?.map(people => (
              <div key={people?.name} className="flex items-center justify-between mb-5 p-2 hover:bg-slate-500 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={people?.userdp} alt={people?.name} />
                    <AvatarFallback>{people?.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm text-black">{people?.name}</p>
                </div>
                <Button
                        size="sm"
                        variant="outline"
                        className="text-black border-black hover:bg-slate-500"
                        onClick={() => {
                            handleFindPath(people.email);
                            handleUserRoute(people.id);
                        }}
                        >
                  View 
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="flex justify-center" onClick={()=>router.push('/users')}>
        <Button>
          Show More
        </Button>

        </div>
      
      </Tabs>
    </CardContent>
  </Card>
   )
}
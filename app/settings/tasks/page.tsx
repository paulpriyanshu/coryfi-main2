'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import TaskComponent from './task-component'
import { getAssignedTasksForEmployee } from '@/app/api/actions/employees'
import { fetchUserId } from '@/app/api/actions/media'


export default function TaskPage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<any[]>(null)
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      if (!session?.user?.email) return
      
      const userData = await fetchUserId(session.user.email)
      const taskData = await getAssignedTasksForEmployee(userData.id)
      console.log("hey",taskData)

      setTasks(taskData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      console.log("status",status)
      fetchTasks()
      const interval = setInterval(fetchTasks, 5000)


      return () => clearInterval(interval)
    }
  }, [status, session])

  if (loading) return <div>Loading tasks...</div>

  return (
    <TaskComponent sampleData={tasks} />
  )
}
'use client'

import { useEffect, useState } from 'react'
import TaskComponent from './task-component'

import { fetchUserId } from '@/app/api/actions/media'
import { getAssignedTasksForEmployee } from '@/app/api/actions/employees'

interface Props {
  initialTasks: any
  email: string | null | undefined
}

const TaskClient: React.FC<Props> = ({ initialTasks, email }) => {
  const [tasks, setTasks] = useState(initialTasks)

  const fetchLatestTasks = async () => {
    if (!email) return
    const user = await fetchUserId(email)
    const newTasks = await getAssignedTasksForEmployee(user.id)
    setTasks(newTasks)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestTasks()
    }, 5000)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [email])

  return <TaskComponent sampleData={tasks} />
}

export default TaskClient
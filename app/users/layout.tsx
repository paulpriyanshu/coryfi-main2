'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import UnconnectedUsersPage from './page'

export default function UsersLayout() {
  const { data: session } = useSession()
  const userEmail = session?.user?.email || ''

  return <UnconnectedUsersPage/>
}


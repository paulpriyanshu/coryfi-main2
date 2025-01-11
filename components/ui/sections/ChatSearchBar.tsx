'use client'

import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  _id: string
  username: string
  avatar?: string
  
}

interface SearchBarProps {
  onSelectUser: (user: User) => void
  currentUserId: string
}

export function ChatSearchBar({ onSelectUser, currentUserId }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const fetchUsers = React.useCallback(async (search: string) => {
    try {
      const response = await fetch(`https://chat.coryfi.com/api/v1/users/${currentUserId}`)
      const data = await response.json()
      setSuggestions(data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [currentUserId])

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        fetchUsers(searchTerm)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, fetchUsers])

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onSelectUser(user)
                setSearchTerm("")
                setShowSuggestions(false)
              }}
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


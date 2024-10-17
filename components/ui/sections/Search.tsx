import React from 'react'
import { Input } from "@/components/ui/Input"
import { Search } from 'lucide-react'

export default function SearchBar() {
  return (
    <div className="relative">
      <Input type="text" placeholder="Search" className="pl-10 pr-4 py-2 w-full" />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, User } from 'lucide-react'
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import axios from 'axios'
import { useAppDispatch, useAppSelector } from '@/app/libs/store/hooks'
import { selectResponseData, setResponseData } from '@/app/libs/features/pathdata/pathSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { fetchUserData, fetchUserId } from '@/app/api/actions/media'

// This would typically come from your API or database
const recentSearches = ['React', 'Next.js', 'Tailwind CSS', 'TypeScript']
const trendingSearches = ['JavaScript', 'Node.js', 'GraphQL', 'Docker']


interface SearchResult { 
  email: string;
  name: string;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [path, setPath] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()
  const router=useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length > 0 && session?.user?.email) {
        setIsLoading(true)
        try {
          const response = await fetch('https://neo.coryfi.com/api/v1/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              searchTerm: term,
              currentUsername: session.user.email
            }),
          })
          const resdata = await response.json()
          setSearchResults(resdata)
        } catch (error) {
          console.error('Error fetching search results:', error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300),
    [session]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearch = (term: string) => {
    
    console.log(`Searching for: ${term}`)
    setSearchTerm(term)
    setShowSuggestions(false)
    // router.push('/')
    
  }

  const handleFindPath = async (email: string) => {
    if (session?.user?.email) {
      try {
        const response = await axios.post("https://neo.coryfi.com/api/v1/getpathranking", {
          targetEmail: email,
          sourceEmail: session.user.email,
          pathIndex:0
        })
        setPath(response.data.path)
        console.log("this is the prop data",response.data)
        dispatch(setResponseData(response.data))
        console.log("this is connect data",response.data)
      } catch (error) {
        console.error('Error finding path:', error)
      }
    }
  }
const handleUserRoute=async(email:string)=>{
  const user=await fetchUserId(email)
  console.log("this is the userdata",user.id)
  router.push(`/userProfile/${user.id}`)


}
  useEffect(() => {
    console.log("this is path", path)
  }, [path])

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSearchResults([])
  }

  return (
    <div ref={searchRef} className="relative mb-6">
      <Card className="p-2 shadow-lg">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchTerm); }} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-9 pr-12"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-primary">Search</Button>
        </form>
      </Card>
      {showSuggestions && (
        <Card className="absolute z-10 w-full mt-1 p-2 shadow-lg">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                <>
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Search Results">
                      {searchResults.map((result) => (
                        <CommandItem key={result.email} onSelect={() => handleFindPath(result.email).then(()=>handleUserRoute(result.email))}>
                          <User className="mr-2 h-4 w-4" />
                          {result.name} ({result.email})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {searchTerm && searchResults.length === 0 && (
                    <CommandGroup heading="Suggestions">
                      <CommandItem onSelect={() => handleSearch(searchTerm)}>
                        <Search className="mr-2 h-4 w-4" />
                        Search for "{searchTerm}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((term) => (
                      <CommandItem key={term} onSelect={() => handleSearch(term)}>
                        <Clock className="mr-2 h-4 w-4" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Trending Searches">
                    {trendingSearches.map((term) => (
                      <CommandItem key={term} onSelect={() => handleSearch(term)}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </Card>
      )}
    </div>
  )
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
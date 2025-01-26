"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, X, Clock, TrendingUp, User, ArrowRight, FileText, Star } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { fetchAllUsers } from "@/app/api/actions/media"
import { AvatarImage } from "@radix-ui/react-avatar"

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const recentSearches = ["React", "Next.js", "Tailwind CSS", "TypeScript"]
const trendingSearches = ["JavaScript", "Node.js", "GraphQL", "Docker"]

interface SearchResult {
  id: string
  email: string
  name: string
  role?: string
  userdp?:string
  attachments?: string[]
  lastActivity?: string
  favorited?: boolean
}

export default function ModernSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()

  const [allUsers, setAllUsers] = useState<SearchResult[]>([])
  const [isUsersCached, setIsUsersCached] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const cachedUsers = localStorage.getItem("searchUsers")
        if (cachedUsers) {
          const parsedUsers = JSON.parse(cachedUsers)
          setAllUsers(parsedUsers)
          setIsUsersCached(true)
        }

        const resdata = await fetchAllUsers()
        // Enrich data with additional mock properties
        const enrichedData = resdata.map(user => ({
          ...user,
          role: user.role || 'User',
          lastActivity: user.lastActivity || '2 days ago',
          favorited: Math.random() > 0.7 // Randomly mark some users as favorited
        }))
        
        setAllUsers(enrichedData)
        console.log("user data",resdata)
        console.log("enriched data",enrichedData)
        localStorage.setItem("searchUsers", JSON.stringify(enrichedData))
        setIsUsersCached(true)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (session?.user?.email) {
      loadUsers()
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const performSearch = useCallback(
    (term: string) => {
      const lowercaseTerm = term.toLowerCase()

      if (lowercaseTerm.length < 2) {
        setSearchResults([])
        return
      }

      const filteredResults = allUsers
        .filter((user) => {
          const matchName = user.name.toLowerCase().includes(lowercaseTerm)
          const matchEmail = user.email.toLowerCase().includes(lowercaseTerm)
          const matchRole = user.role?.toLowerCase().includes(lowercaseTerm)
          return matchName || matchEmail || matchRole
        })
        .slice(0, 10)

      setSearchResults(filteredResults)
    },
    [allUsers],
  )

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (isUsersCached && term.length >= 2) {
          setIsLoading(true)
          try {
            performSearch(term)
          } catch (error) {
            console.error("Error searching:", error)
            setSearchResults([])
          } finally {
            setIsLoading(false)
          }
        } else {
          setSearchResults([])
        }
      }, 300),
    [performSearch, isUsersCached],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setShowSuggestions(false)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setShowSuggestions(false)
    setSearchResults([])
  }

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div ref={searchRef} className="max-w-xl mx-auto p-4 space-y-4">
      <Card className="p-2 shadow-lg  rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchTerm)
          }}
          className="relative"
        >
          <Input
            type="text"
            placeholder="Search users, roles, emails..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-10 py-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 placeholder-gray-500 text-base"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </form>
      </Card>

      {showSuggestions && (
        <Card className="p-2 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {isLoading ? (
                <CommandItem disabled>Searching...</CommandItem>
              ) : (
                <>
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Search Results">
                      {searchResults.map((result) => (
                        <CommandItem key={result.id}>
                          <Link
                            href={`/userProfile/${result.id}`}
                            className="flex items-center w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                          <Avatar className="h-10 w-10 mr-3">
                                {result.userdp ? (
                                    <AvatarImage src={result.userdp} alt={result.name} />
                                ) : (
                                    <AvatarFallback>{getAvatarFallback(result.name)}</AvatarFallback>
                                )}
                                </Avatar>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">{result.name}</span>
                                {result.favorited && <Star className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <div className="text-sm text-gray-500">{result.email}</div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {result.role} • Last active {result.lastActivity}
                              </div>
                              {result.attachments && result.attachments.length > 0 && (
                                <div className="text-xs text-gray-400 flex items-center mt-1">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {result.attachments.length} attachment{result.attachments.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </Link>
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
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandGroup heading="Trending Searches">
                    {trendingSearches.map((term) => (
                      <CommandItem key={term} onSelect={() => handleSearch(term)}>
                        <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
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
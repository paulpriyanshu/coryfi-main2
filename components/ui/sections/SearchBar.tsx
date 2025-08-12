"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, X, Clock, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { fetchAllUsers } from "@/app/api/actions/media"
import Image from "next/image"

// Debounce function with added performance tracking
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// This would typically come from your API or database
const recentSearches = ["React", "Next.js", "Tailwind CSS", "TypeScript"]
const trendingSearches = ["JavaScript", "Node.js", "GraphQL", "Docker"]

interface SearchResult {
  id: string
  email: string
  name: string
  userdp:string
  attachments?: string[]
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Cached users with faster initial search
  const [allUsers, setAllUsers] = useState<SearchResult[]>([])
  const [isUsersCached, setIsUsersCached] = useState(false)

  // Fetch users with caching and quick initial loading
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Check if users are in localStorage to improve initial load
        const cachedUsers = localStorage.getItem("searchUsers")
        if (cachedUsers) {
          const parsedUsers = JSON.parse(cachedUsers)
          setAllUsers(parsedUsers)
          setIsUsersCached(true)
        }

        // Always fetch fresh data in background
        const resdata = await fetchAllUsers()
        setAllUsers(resdata)

        // Update localStorage for faster subsequent loads
        localStorage.setItem("searchUsers", JSON.stringify(resdata))
        setIsUsersCached(true)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (session?.user?.email) {
      loadUsers()
    }
  }, [session])

  // Click outside handler to close suggestions
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

  // Optimized search function with faster filtering
  const performSearch = useCallback(
    (term: string) => {
      const lowercaseTerm = term.toLowerCase()

      // Early return if term is too short
      if (lowercaseTerm.length < 2) {
        setSearchResults([])
        return
      }

      // Use faster filtering method
      const filteredResults = allUsers
        .filter((user) => {
          const matchName = user.name.toLowerCase().includes(lowercaseTerm)
          const matchEmail = user.email.toLowerCase().includes(lowercaseTerm)
          const matchDp = user.userdp
          return matchName || matchEmail || matchDp
        })
        .slice(0, 10) // Limit results to prevent performance issues

      setSearchResults(filteredResults)
    },
    [allUsers],
  )

  // Memoized debounced search with faster response
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        // Immediately show results if cached
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
      }, 100), // Reduced debounce time
    [performSearch, isUsersCached],
  )

  // Trigger search on term change
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  // Handle search submission
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setShowSuggestions(false)
  }

  // Route to user profile
  // const handleUserRoute = async (id: string) => {
  //   router.prefetch(`/userProfile/${id}`)
  //   router.push(`/userProfile/${id}`)
  // }

  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm("")
    setShowSuggestions(false)
    setSearchResults([])
  }

  return (
    <div ref={searchRef} className="hidden md:block relative mb-6 dark:bg-black dark:text-white">
      <Card className="p-2 shadow-lg dark:bg-black dark:border border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchTerm)
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 md:h-4 md:w-4 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-9 pr-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-primary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            Search
          </Button>
        </form>
      </Card>
      {showSuggestions && (
        <Card className="absolute z-10 w-full mt-1 p-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <Command className="dark:bg-gray-800">
            <CommandList>
              <CommandEmpty className="dark:text-gray-400">No results found.</CommandEmpty>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                <>
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Search Results" className="dark:text-gray-300">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          // onSelect={() => handleUserRoute(result.id)}
                          href={`/userProfile/${result.id}`}
                          className="flex items-center"
                        > 
                        <Image
                              src={result.userdp}
                              alt="User profile picture"
                              width={16}
                              height={16}
                              className="mr-2 h-4 w-4 rounded-full object-cover"
                            />
                          <div>
                            <div>
                              {result.name}
                            </div>
                            {result.attachments && result.attachments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Attachments: {result.attachments.join(", ")}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </CommandGroup>
                  )}
                  {searchTerm && searchResults.length === 0 && (
                    <CommandGroup heading="Suggestions" className="dark:text-gray-300">
                      <CommandItem
                        onSelect={() => handleSearch(searchTerm)}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search for "{searchTerm}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Recent Searches" className="dark:text-gray-300">
                    {recentSearches.map((term) => (
                      <CommandItem
                        key={term}
                        onSelect={() => handleSearch(term)}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Trending Searches" className="dark:text-gray-300">
                    {trendingSearches.map((term) => (
                      <CommandItem
                        key={term}
                        onSelect={() => handleSearch(term)}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
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

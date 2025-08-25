"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, X, Clock, TrendingUp, User, ArrowRight, CommandIcon } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { fetchAllUsers } from "@/app/api/actions/media"
import Image from "next/image"
import Link from "next/link"

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
  id: number
  email: string
  name: string
  userdp?: string
  userDetails: {
    bio?: string
    displayImage?: string
    phoneNumber?: string
    addresses?: {
      street?: string
      city?: string
      state?: string
    }[]
  }
  attachments?: string[]
}

function UserAvatar({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageError ? (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-background shadow-sm"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-background shadow-sm">
          <User className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  )
}

export default function ModernSearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [allUsers, setAllUsers] = useState<SearchResult[]>([])
  const [isUsersCached, setIsUsersCached] = useState(false)

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isModalOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen])

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
        setAllUsers(resdata)
        localStorage.setItem("searchUsers", JSON.stringify(resdata))
        setIsUsersCached(true)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    loadUsers()
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
          const matchBio = user.userDetails?.bio?.toLowerCase().includes(lowercaseTerm)
          return matchName || matchEmail || matchBio
        })
        .slice(0, 8)

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
      }, 150),
    [performSearch, isUsersCached],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setIsModalOpen(false)
  }

  const handleUserRoute = (id: number) => {
    // alert(`Would navigate to user profile: ${id}`)
    
    setIsModalOpen(false)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <>
      <div className="hidden md:block relative">
        <Button
          variant="outline"
          className="w-full h-12 justify-start  text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-300 border  hover:border-primary/30 bg-white dark:bg-black dark:text-white backdrop-blur-sm shadow-sm hover:shadow-md group"
          onClick={() => setIsModalOpen(true)}
        >
          <Search className="mr-3 h-5 w-5 text-muted-foreground dark:text-white group-hover:text-primary transition-colors" />
          <span className="text-base">Search users...</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1">
            </div>
          </div>
        </Button>
      </div>

      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full  bg-background/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in-0 duration-300"
            onClick={handleModalClose}
          />

          <div className="relative w-full max-w-3xl animate-in zoom-in-95 slide-in-from-top-4 duration-300">
            <Card className="border border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search for users, projects, or anything..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-5 pr-5 h-16 text-sm md:text-lg border-0 bg-background/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 rounded-xl shadow-sm"
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted/50 rounded-full"
                        onClick={handleClearSearch}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full hover:bg-muted/50"
                    onClick={handleModalClose}
                  >
                    <X className="h-5 w-5" />
                  </Button> */}
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                <Command className="bg-transparent">
                  <CommandList>
                    {isLoading ? (
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center gap-3 text-muted-foreground">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-lg">Searching...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {searchResults.length > 0 && (
                          <CommandGroup heading="People" className="p-4">
                            <div className="space-y-2">
                     {searchResults.map((result, index) => (
                          <Link
                            key={result.id}
                            href={`https://connect.coryfi.com/userProfile/${result.id}`}
                            onClick={handleModalClose}
                            className="flex items-center gap-4 p-4 cursor-pointer rounded-xl hover:bg-accent/60 transition-all duration-200 animate-in slide-in-from-left-1 border border-transparent hover:border-border/30"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <UserAvatar src={result.userdp} alt={`${result.name}'s profile picture`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground truncate text-md md:text-lg">{result.name}</div>
                              <div className="text-sm text-muted-foreground truncate leading-relaxed">
                                {result?.userDetails?.bio?.split(" ").slice(0, 15).join(" ")}
                              </div>
                              {/* <div className="text-xs text-muted-foreground/70 mt-2 font-medium">
                                {result.email}
                              </div> */}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </Link>
                        ))}
                            </div>
                          </CommandGroup>
                        )}

                        {searchTerm && searchResults.length === 0 && !isLoading && (
                          <div className="p-12 text-center">
                            <div className="text-muted-foreground mb-6 text-lg">
                              No results found for "{searchTerm}"
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleSearch(searchTerm)}
                              className="gap-2 h-12 px-6 rounded-xl"
                            >
                              <Search className="h-5 w-5" />
                              Search anyway
                            </Button>
                          </div>
                        )}

                        {!searchTerm && (
                          <div className="p-4 space-y-6">
                            <CommandGroup heading="Recent Searches" className="mb-6">
                              <div className="space-y-2">
                                {recentSearches.map((term, index) => (
                                  <CommandItem
                                    key={term}
                                    onSelect={() => handleSearch(term)}
                                    className="flex items-center gap-4 p-4 cursor-pointer rounded-xl hover:bg-accent/60 transition-all duration-200 animate-in slide-in-from-left-1 border border-transparent hover:border-border/30"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                                      <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="flex-1 text-base">{term}</span>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                                  </CommandItem>
                                ))}
                              </div>
                            </CommandGroup>

                            <CommandGroup heading="Trending">
                              <div className="space-y-2">
                                {trendingSearches.map((term, index) => (
                                  <CommandItem
                                    key={term}
                                    onSelect={() => handleSearch(term)}
                                    className="flex items-center gap-4 p-4 cursor-pointer rounded-xl hover:bg-accent/60 transition-all duration-200 animate-in slide-in-from-left-1 border border-transparent hover:border-border/30"
                                    style={{ animationDelay: `${(index + recentSearches.length) * 50}ms` }}
                                  >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                                      <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="flex-1 text-base">{term}</span>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                                  </CommandItem>
                                ))}
                              </div>
                            </CommandGroup>
                          </div>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

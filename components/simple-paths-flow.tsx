"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, ExpandIcon as Explore, CheckCircle, ArrowLeft, Heart } from "lucide-react"
import { connect_users } from "@/app/api/actions/network"
import { doneIntroductoryFlow } from "@/app/api/actions/user"
import { useRouter } from "next/navigation"
import { saveUserSubcategories } from "@/app/api/actions/user"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { getCategories } from "@/app/pathAnalytics/analytics-actions"

interface User {
  id: number
  name: string
  email: string
  avatar: string
  connected?: boolean
  requestSent?: boolean
  isCompany?: boolean
  userdp?: string
  userDetails?: {
    bio?: string
  }
}

interface Segment {
  id: number
  name: string
}

interface Subcategory {
  id: number
  name: string
  segments: Segment[]
}

interface Category {
  id: number
  name: string
  subcategories: Subcategory[]
}

export default function SimplePathsFlow({
  users,
  userInterests,
  userId,
}: { users: any; userInterests: []; userId: number }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [requestsSent, setRequestsSent] = useState(users?.connectionCount || 0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const { data: session } = useSession()
  const [setupStatus, setSetupStatus] = useState("Start Exploring")
  const router = useRouter()

  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isSubmittingInterests, setIsSubmittingInterests] = useState(false)

  // Track request status per user
  const [userRequestStatus, setUserRequestStatus] = useState<Record<number, "idle" | "sending" | "sent">>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  console.log("users", users)

  // Fixed logic: skip step 2 if users is undefined or users.users is empty
  const skipStep2 = !users || !users.users || users.users.length === 0
  const skipInterestsStep = userInterests > 0
  const canProceed = requestsSent >= 5

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Show button when user has scrolled down at least 200px from top
    // Hide button when user is within 200px of the bottom
    const showButton = scrollTop > 200 && scrollTop + windowHeight < documentHeight - 200
    setShowScrollButton(showButton)
  }

  useEffect(() => {
    if (currentStep === 2 && canProceed && !autoAdvancing) {
      setAutoAdvancing(true)
      // Add a small delay for better UX - let users see the completion state
      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          // Skip to step 4 if interests step should be skipped, otherwise go to step 3
          setCurrentStep(skipInterestsStep ? 4 : 3)
          setIsTransitioning(false)
          setAutoAdvancing(false)
        }, 300)
      }, 1500) // 1.5 second delay to show completion
    }
  }, [currentStep, canProceed, autoAdvancing, skipInterestsStep])

  useEffect(() => {
    async function categoriesFetcher() {
      try {
        setIsLoadingCategories(true)
        const fetchedCategories = await getCategories()
        console.log("categories", fetchedCategories)
        setCategories(fetchedCategories || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    categoriesFetcher()
  }, [])

  useEffect(() => {
    // Only add scroll listener when in step 3
    if (currentStep === 3) {
      window.addEventListener("scroll", handleScroll)
      handleScroll() // Check initial position

      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    } else {
      setShowScrollButton(false)
    }
  }, [currentStep])

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const sendRequest = async (user: User) => {
    if (!session?.user?.email || !session?.user?.name) return

    // Set status to sending for this specific user
    setUserRequestStatus((prev) => ({
      ...prev,
      [user.id]: "sending",
    }))

    try {
      await connect_users(session.user.email, session.user.name, user.email, 10)

      // Set status to sent for this specific user
      setUserRequestStatus((prev) => ({
        ...prev,
        [user.id]: "sent",
      }))

      // Increment the total requests sent count
      setRequestsSent((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to send request:", error)
      // Reset status on error
      setUserRequestStatus((prev) => ({
        ...prev,
        [user.id]: "idle",
      }))
    }
  }

  const handleNext = () => {
    const next = currentStep + 1
    if (next === 2 && skipStep2) {
      // Skip step 2, go to step 3 or 4 depending on interests
      setCurrentStep(skipInterestsStep ? 4 : 3)
    } else if (next === 3 && skipInterestsStep) {
      // Skip interests step, go directly to completion
      setCurrentStep(4)
    } else {
      setCurrentStep(next)
    }
  }

  const handleInterestsSubmit = async () => {
    if (selectedSubcategories.length === 0) return

    setIsSubmittingInterests(true)
    try {
      console.log("selected subcategories", selectedSubcategories)
      await saveUserSubcategories(userId, selectedSubcategories)

      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(4) // Move to completion step
        setIsTransitioning(false)
      }, 300)
    } catch (error) {
      console.error("Failed to save interests:", error)
    } finally {
      setIsSubmittingInterests(false)
    }
  }

  const handleSetup = async () => {
    try {
      setSetupStatus("Setting Up...")
      await doneIntroductoryFlow(session?.user?.email)
      console.log("Setup complete! Would navigate to home page.")
      setSetupStatus("Setup Complete!")
    } catch (error) {
      console.error("Setup failed:", error)
      setSetupStatus("Setup failed. Please try again.")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        if (currentStep === 4 && skipInterestsStep && skipStep2) {
          // Go back to step 1 if both step 2 and 3 are skipped
          setCurrentStep(1)
        } else if (currentStep === 4 && skipInterestsStep) {
          // Go back to step 2 if only interests step is skipped
          setCurrentStep(2)
        } else if (currentStep === 3 && skipStep2) {
          // Go back to step 1 if step 2 is skipped
          setCurrentStep(1)
        } else {
          setCurrentStep(currentStep - 1)
        }
        setIsTransitioning(false)
      }, 300)
    }
  }

  const toggleSubcategory = (subcategoryId: number) => {
    console.log("Toggling subcategory:", subcategoryId, "Current selected:", selectedSubcategories)

    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategoryId)) {
        console.log("Removing subcategory:", subcategoryId)
        return prev.filter((id) => id !== subcategoryId)
      } else {
        console.log("Adding subcategory:", subcategoryId)
        return [...prev, subcategoryId]
      }
    })
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const renderStep3 = () => {
    const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex h-screen">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}

          <div
            className={`
            fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 sm:p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Categories</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-1">Select a category to explore</p>
                <div className="mt-2 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full inline-block">
                  {categories.length} categories available
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {isLoadingCategories ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 mx-auto mb-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategoryId(category.id)
                          setIsSidebarOpen(false) // Close mobile sidebar
                        }}
                        className={`
                          w-full text-left p-3 rounded-lg transition-all duration-200 relative
                          ${
                            selectedCategoryId === category.id
                              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10"
                              : "hover:bg-slate-700/50 text-slate-300 hover:text-white border border-transparent"
                          }
                        `}
                      >
                        {selectedCategoryId === category.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                        )}
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                          <span>{category.subcategories.length} subcategories</span>
                          {selectedCategoryId === category.id && <span className="text-blue-400">●</span>}
                        </div>
                      </button>
                    ))}

                    {categories.length > 5 && (
                      <div className="text-center py-2 text-xs text-slate-500">Scroll for more categories</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isSidebarOpen && (
            <div className="fixed left-0 top-1/4 -translate-y-1/2 z-30 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="bg-blue-600/90 backdrop-blur-md text-white p-2  rounded-r-lg shadow-lg hover:bg-blue-700/90 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="text-xs font-medium">Categories</div>
                  <div className="text-xs text-blue-200">{categories.length}</div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg relative"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {categories.length}
                    </div>
                  </button>

               
                </div>

                {renderProgressDots()}
              </div>

              <div className="text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">Select Your Interests</h2>
                <p className="text-slate-300 mb-4 text-sm sm:text-base max-w-2xl mx-auto">
                  Choose the subcategories that match your interests to get better recommendations
                </p>
                <Badge
                  variant="outline"
                  className="text-blue-400 border-blue-400/50 bg-blue-400/10 px-3 sm:px-4 py-1 sm:py-2 text-sm"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Selected: {selectedSubcategories.length}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              <div className="p-4 sm:p-6 lg:p-8">
                {selectedCategory ? (
                  <div>
                    <div className="mb-6 sticky top-0 bg-slate-900/80 backdrop-blur-sm p-4 -m-4 rounded-lg border border-slate-700/30">
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                        {selectedCategory.name}
                        <Badge variant="secondary" className="ml-3 text-xs bg-slate-700/50 text-slate-300">
                          {selectedCategory.subcategories.length} subcategories
                        </Badge>
                      </h3>
                      <p className="text-slate-400 text-sm">Select the subcategories that interest you</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                      {selectedCategory.subcategories.map((subcategory) => {
                        const isSelected = selectedSubcategories.includes(subcategory.id)

                        return (
                          <div
                            key={subcategory.id}
                            className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                              isSelected
                                ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20"
                                : "border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-800/30"
                            }`}
                            onClick={() => toggleSubcategory(subcategory.id)}
                          >
                            {/* Subcategory Header with Checkbox */}
                            <div className="flex items-start space-x-3 mb-3">
                              <Checkbox
                                id={`subcategory-${subcategory.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleSubcategory(subcategory.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-white mb-2 flex items-center">
                                  {subcategory.name}
                                  {isSelected && <CheckCircle className="w-4 h-4 ml-2 text-blue-400" />}
                                </h4>

                                {/* Segments Preview */}
                                <div className="flex flex-wrap gap-2">
                                  {subcategory.segments.slice(0, 4).map((segment) => (
                                    <Badge
                                      key={segment.id}
                                      variant="secondary"
                                      className="text-xs bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                                    >
                                      {segment.name}
                                    </Badge>
                                  ))}
                                  {subcategory.segments.length > 4 && (
                                    <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-400">
                                      +{subcategory.segments.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedCategory.subcategories.length > 6 && (
                      <div className="text-center py-4 text-sm text-slate-500 border-t border-slate-700/30">
                        {selectedSubcategories.length > 0 ? (
                          <span className="text-blue-400">
                            {selectedSubcategories.length} selected • Scroll up to see all options
                          </span>
                        ) : (
                          "Scroll up to see all subcategories"
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p>Select a category from the sidebar to view subcategories</p>
                      <p className="text-sm mt-2 lg:hidden">
                        Tap the menu button or swipe from left to open categories
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Bar with Continue Button */}
            <div className="border-t border-slate-700/50 bg-slate-800/90 backdrop-blur-sm p-4 sm:p-6 flex-shrink-0">
  <div className="flex items-center justify-between">
    {/* Back Button */}
    <Button
      onClick={handlePrevious}
      variant="outline"
      size="sm"
      className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
      disabled={isSubmittingInterests}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>

    {/* Continue Button */}
    <Button
      onClick={handleInterestsSubmit}
      disabled={
        selectedSubcategories.length === 0 ||
        isSubmittingInterests ||
        isLoadingCategories
      }
      size="lg"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-2 sm:py-3 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
    >
      {isSubmittingInterests ? (
        <>
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Saving...
        </>
      ) : (
        <>
          Continue
          {selectedSubcategories.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-white/20 text-white"
            >
              {selectedSubcategories.length}
            </Badge>
          )}
        </>
      )}
    </Button>
  </div>
</div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div
      className="min-h-screen 
  bg-gradient-to-br 
  from-blue-400 via-blue-400 to-blue-600 
  dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
  flex flex-col items-center justify-center 
  p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="flex justify-center mb-10">
          {/* Dark Logo */}
          <Image
            src="/coryfi-connect-light.png"
            alt="Company Logo"
            width={120}
            height={80}
            className="w-auto h-1/2 md:h-1/2"
          />
        </div>
        <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
          Introducing Paths
        </h1>
        <p className="text-slate-200 text-base font-semibold sm:text-lg lg:text-xl max-w-2xl leading-relaxed">
          Discover connections and build your professional network through intelligent path mapping
        </p>
      </div>

      {/* Video Container - Responsive */}
      <div
        className="relative 
        w-[95vw] h-1/3       
        sm:w-full sm:h-auto     
        sm:max-w-md                 
        lg:max-w-xl                 
        aspect-video                 
        bg-slate-800/50                 
        backdrop-blur-sm                 
        rounded-xl                 
        sm:rounded-2xl                 
        border border-slate-700/50                 
        shadow-2xl                 
        mb-4 sm:mb-6                 
        overflow-hidden"
      >
        <div className="w-full h-full bg-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <video className="w-full h-full rounded-lg shadow-lg" src="/paths_flow3.mp4" autoPlay loop muted playsInline>
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-2 sm:mt-5">
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
            disabled={autoAdvancing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {renderProgressDots()}
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
            Users Registered in Coryfi
          </h2>
          <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
            Send connection requests to at least 5 users to proceed
          </p>
          <Badge
            variant="outline"
            className={`text-blue-400 border-blue-400/50 bg-blue-400/10 px-3 sm:px-4 py-1 sm:py-2 text-sm transition-all duration-300 ${
              canProceed ? "border-green-400/50 bg-green-400/10 text-green-400" : ""
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Requests Sent: {requestsSent}/5
          </Badge>

          {/* Auto-advance notification */}
          {canProceed && autoAdvancing && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">🎉 Great! Automatically proceeding to the next step...</p>
            </div>
          )}
        </div>

        {/* User Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {users?.users?.map((user) => (
            <Card
              key={user.id}
              className="border-slate-700/50 backdrop-blur-sm  transition-all duration-300 dark:bg-slate-900 dark:text-white"
            >
              <CardContent className="p-4 sm:p-6 text-center">
                {/* Avatar */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mx-auto mb-3 sm:mb-4 border-2 border-slate-600">
                  <img
                    src={user.userdp || "/placeholder.svg?height=64&width=64"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <h3 className="dark:text-white text-black font-medium mb-2 text-sm sm:text-base truncate">
                  {user.name}
                </h3>
                {user?.userDetails?.bio && (
                  <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{user.userDetails.bio}</p>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => sendRequest(user)}
                  disabled={isButtonDisabled(user) || autoAdvancing}
                  size="sm"
                  className={getButtonClassName(user)}
                >
                  {getButtonContent(user)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Button - Hidden when auto-advancing */}
        {!autoAdvancing && (
          <div className="text-center">
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-2 sm:py-3 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto text-center">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {renderProgressDots()}
        </div>

        {/* Completion Message */}
        <div className="mb-8 sm:mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Setup Complete 🎉</h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
            {"You're all set. Start exploring new connections and opportunities now."}
          </p>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          onClick={handleSetup}
        >
          <Explore className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {setupStatus}
        </Button>
      </div>
    </div>
  )

  const getTotalSteps = () => {
    let total = 4 // Base steps: intro, users, interests, completion
    if (skipStep2) total -= 1
    if (skipInterestsStep) total -= 1
    return total
  }

  const getCurrentStepForProgress = () => {
    let adjustedStep = currentStep
    if (skipStep2 && currentStep > 1) adjustedStep -= 1
    if (skipInterestsStep && currentStep > 2) adjustedStep -= 1
    return adjustedStep
  }

  const renderProgressDots = () => {
    const totalSteps = getTotalSteps()
    const currentStepForProgress = getCurrentStepForProgress()

    return (
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${index + 1 === currentStepForProgress ? "bg-blue-500" : "bg-slate-600"}`}
          />
        ))}
      </div>
    )
  }

  const getButtonContent = (user: User) => {
    const status = userRequestStatus[user.id] || "idle"

    if (user?.requestSent || status === "sent") {
      return (
        <>
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Sent
        </>
      )
    }

    if (status === "sending") {
      return (
        <>
          <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Sending...
        </>
      )
    }

    return (
      <>
        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
        Send Request
      </>
    )
  }

  const isButtonDisabled = (user: User) => {
    const status = userRequestStatus[user.id] || "idle"
    return user?.requestSent || status === "sending" || status === "sent"
  }

  const getButtonClassName = (user: User) => {
    const status = userRequestStatus[user.id] || "idle"
    const baseClasses = "w-full transition-all duration-300 text-xs sm:text-sm"

    if (user?.requestSent || status === "sent") {
      return `${baseClasses} bg-green-600 hover:bg-green-600 shadow-green-500/20`
    }

    if (status === "sending") {
      return `${baseClasses} bg-blue-500 hover:bg-blue-500 shadow-blue-500/20 cursor-not-allowed`
    }

    return `${baseClasses} bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:scale-105`
  }

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
        }`}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && !skipStep2 && renderStep2()}
        {currentStep === 3 && !skipInterestsStep && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  )
}

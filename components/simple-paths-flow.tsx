"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, ExpandIcon as Explore, CheckCircle, ArrowLeft } from "lucide-react"
import { connect_users } from "@/app/api/actions/network"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { doneIntroductoryFlow } from "@/app/api/actions/user"
import { useRouter } from "next/navigation"

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

export default function SimplePathsFlow({ users }: any) {
  const [currentStep, setCurrentStep] = useState(1)
  const [requestsSent, setRequestsSent] = useState(users?.connectionCount || 0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const { data: session, status } = useSession()
  const [setupStatus, setSetupStatus] = useState("Start Exploring")
  const router = useRouter()

  // Track request status per user
  const [userRequestStatus, setUserRequestStatus] = useState<Record<number, "idle" | "sending" | "sent">>({})

  console.log("users", users)

  // Fixed logic: skip step 2 if users is undefined or users.users is empty
  const skipStep2 = !users || !users.users || users.users.length === 0
  const canProceed = requestsSent >= 5

  // Auto-advance to step 3 when 5 requests are sent
  useEffect(() => {
    if (currentStep === 2 && canProceed && !autoAdvancing) {
      setAutoAdvancing(true)
      // Add a small delay for better UX - let users see the completion state
      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentStep(3)
          setIsTransitioning(false)
          setAutoAdvancing(false)
        }, 300)
      }, 1500) // 1.5 second delay to show completion
    }
  }, [currentStep, canProceed, autoAdvancing])

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
      setCurrentStep(3)
    } else {
      setCurrentStep(next)
    }
  }

  const handleSetup = async () => {
    try {
      setSetupStatus("Setting Up...")
      await doneIntroductoryFlow(session?.user?.email)
      router.push("/")
    } catch (error) {
      console.error("Setup failed:", error)
      setSetupStatus("Setup failed. Please try again.")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(skipStep2 ? currentStep - 2 : currentStep - 1)
        setIsTransitioning(false)
      }, 300)
    }
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

  const renderStep1 = () => (
    <div className="min-h-screen 
  bg-gradient-to-br 
  from-blue-200 via-blue-300 to-blue-400 
  dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
  flex flex-col items-center justify-center 
  p-4 sm:p-6 lg:p-8"
>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="flex justify-center mb-10">
          <Image
            src="/coryfi-connect-dark.png"
            alt="Company Logo"
            width={120}
            height={40}
            className="w-auto h-1/3 md:h-1/3 dark:hidden"
          />
          {/* Dark Logo */}
          <Image
            src="/coryfi-connect-light.png"
            alt="Company Logo"
            width={120}
            height={40}
            className="w-auto h-1/3 md:h-1/3 hidden dark:block"
          />
        </div>
        <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
          Introducing Paths
        </h1>
        <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed">
          Discover connections and build your professional network through intelligent path mapping
        </p>
      </div>

      {/* Video Container - Responsive */}
      <div
        className="relative 
        w-[95vw] h-1/3       // For smaller screens: almost full width and decent height
        sm:w-full sm:h-auto     // On sm and above: let aspect ratio control height
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
        <video
          src="/paths_flow3.mp4"
          className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
          autoPlay
          muted
          loop
          playsInline
        />
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

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          </div>
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
                <h3 className="dark:text-white text-black font-medium mb-2 text-sm sm:text-base truncate">{user.name}</h3>
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

  const renderStep3 = () => (
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

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
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

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
        }`}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && !skipStep2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  )
}

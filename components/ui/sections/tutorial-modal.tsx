"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X, Play, Users, Target, Lightbulb } from 'lucide-react'
import Image from "next/image"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      title: "Welcome to Paths",
      content: (
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Paths Feature!
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto px-4">
              Discover the smartest way to connect with anyone in your professional network through mutual connections.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
              <span>Smart networking made simple</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Solving Cold Outreach",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              No More Cold Approaches
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto px-4">
              Paths was created to eliminate awkward cold outreach by finding warm introduction routes through your existing network.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3 p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">Cold emails with low response rates</span>
                </div>
                <div className="flex items-center gap-3 p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">Awkward LinkedIn messages</span>
                </div>
                <div className="flex items-center gap-3 p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">No context or credibility</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 order-1 lg:order-2">
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2 border-2 border-dashed border-blue-200 dark:border-blue-700">
                <Image
                  src="/tutorial1.png"
                  alt="Professional networking illustration"
                  width={400}
                  height={300}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "How It Works - Example",
      content: (
        <div className="space-y-2 sm:space-y-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              See Paths in Action
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
              Watch how to find and use connection paths effectively
            </p>
          </div>
          <div className="relative bg-black rounded-lg overflow-hidden flex justify-center">
            <video
              className="w-full max-w-md h-auto rounded-lg"
              controls
              poster="/placeholder.svg?height=300&width=500"
              playsInline
              muted
            >
              <source src="/paths_flow3.mp4" type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="space-y-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Enter target contact</p>
            </div>
            <div className="space-y-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">View connection paths</p>
            </div>
            <div className="space-y-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Request introduction</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Full Introduction",
      content: (
        <div className="space-y-4  w-full flex flex-col justify-center items-center">
          <div className="text-center space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Path Tutorial
            </h3>
          </div>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-5/6">
            <iframe
              className="w-full h-full flex justify-center"
              src="https://www.youtube.com/embed/1Eaf81zjCG8?autoplay=0&playsinline=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleClose = () => {
    setCurrentSlide(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold pr-4">
              {slides[currentSlide].title}
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Slide Content */}
            <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center py-4">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>

        {/* Fixed Navigation Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 border-t bg-background">
          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1 sm:gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? "bg-blue-600 dark:bg-blue-400"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={nextSlide}
                className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Step {currentSlide + 1} of {slides.length}</span>
              <span>{Math.round(((currentSlide + 1) / slides.length) * 100)}% Complete</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

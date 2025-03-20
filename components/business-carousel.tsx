"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BannerCarouselProps {
  images: string[]
  onRemove: (index: number) => void
}

export default function BannerCarousel({ images, onRemove }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted aspect-[3/1]">
        <div className="text-center">
          <p className="text-muted-foreground">No banner images</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <div className="absolute top-1/2 left-4 -translate-y-1/2 z-20">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}

      {/* Current Image */}
      <div className="w-full h-full transition-transform duration-500 ease-out">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Banner ${currentIndex + 1}`}
          className="object-cover w-full h-full"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
          onClick={() => onRemove(currentIndex)}
        >
          <span className="sr-only">Remove image</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>

      {/* Dots Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? "bg-white w-4" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}


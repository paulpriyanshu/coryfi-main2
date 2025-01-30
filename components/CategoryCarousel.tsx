"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CategoryCarousel({ categories }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesCount, setSlidesCount] = useState(1)

  useEffect(() => {
    const updateSlidesCount = () => {
      if (window.innerWidth >= 1024) {
        setSlidesCount(Math.ceil(categories.length / 3))
      } else if (window.innerWidth >= 640) {
        setSlidesCount(Math.ceil(categories.length / 2))
      } else {
        setSlidesCount(categories.length)
      }
    }

    updateSlidesCount()
    window.addEventListener("resize", updateSlidesCount)
    return () => window.removeEventListener("resize", updateSlidesCount)
  }, [categories.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesCount)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: slidesCount }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0 flex gap-4">
              {categories.slice(slideIndex * 3, slideIndex * 3 + 3).map((category, index) => (
                <div key={index} className="w-full sm:w-1/2 lg:w-1/3 aspect-video relative">
                  <Image
                    src={`/placeholder.svg?height=200&width=300&text=Category ${category}`}
                    alt={`Category ${category}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xl font-bold">
                    Category {category}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hover:bg-background/75"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hover:bg-background/75"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}


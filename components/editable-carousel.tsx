"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditableCarouselProps {
  images: number[]
  height?: number
  isEditing: boolean
  onUpdate: (images: number[]) => void
}

export function EditableCarousel({ images, height = 300, isEditing, onUpdate }: EditableCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const addImage = () => {
    onUpdate([...images, images.length + 1])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onUpdate(newImages)
    if (currentSlide >= newImages.length) {
      setCurrentSlide(newImages.length - 1)
    }
  }

  return (
    <div className={`relative w-full h-[${height}px] bg-muted`}>
      <div className="absolute inset-0">
        {images.map((_, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={`/placeholder.svg?height=${height}&width=1200&text=Image ${index + 1}`}
              alt={`Carousel Image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {isEditing && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeImage(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="bg-background/50 backdrop-blur-sm hover:bg-background/75"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="bg-background/50 backdrop-blur-sm hover:bg-background/75"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? "bg-primary" : "bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-4 bg-background/50 backdrop-blur-sm hover:bg-background/75"
          onClick={addImage}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Image
        </Button>
      )}
    </div>
  )
}


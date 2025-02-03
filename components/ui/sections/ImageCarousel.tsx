"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface ImageCarouselProps {
  images?: string[]
  videos?: string[]
}

export default function ImageCarousel({ images, videos }: ImageCarouselProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images?.map((url, idx) => (
          <CarouselItem key={`image-${idx}`}>
            <ImageWithOrientation src={url || "/placeholder.svg"} alt={`Post content ${idx + 1}`} />
          </CarouselItem>
        ))}
        {videos?.map((url, idx) => (
          <CarouselItem key={`video-${idx}`}>
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <video src={url} controls className="rounded-lg w-full h-full object-contain" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {(images?.length || 0) + (videos?.length || 0) > 1 && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  )
}

function ImageWithOrientation({ src, alt }: { src: string; alt: string }) {
  const [orientation, setOrientation] = useState("landscape")
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      setOrientation(img.width > img.height ? "landscape" : "portrait")
      setDimensions({ width: img.width, height: img.height })
    }
    img.src = src
  }, [src])

  return (
    <div
      className={`relative w-full ${orientation === "portrait" ? "h-[70vh]" : ""}`}
      style={orientation === "landscape" ? { aspectRatio: "16 / 9" } : {}}
    >
      <Image src={src || "/placeholder.svg"} alt={alt} layout="fill" objectFit="contain" className="rounded-lg" />
    </div>
  )
}


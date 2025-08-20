"use client"

import { useState, useEffect, useRef } from "react"
// import img from "next/image"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function CategoryCarousel({ categories, productSectionId }) {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const [totalSlides, setTotalSlides] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const carouselRef = useRef(null)
  const autoplayRef = useRef(null)
  const progressRef = useRef(null)

  // Enhanced categories with images and descriptions
  const [enhancedCategories, setEnhancedCategories] = useState([])
  console.log("all categories", categories)

  useEffect(() => {
    // Only run this on the client side
    setEnhancedCategories(
      categories?.map((category, index) => ({
        id: index,
        name: category.name,
        image: `${category.images[0]}`,
        description: `Explore our ${category?.name?.toLowerCase()} collection`,
        itemCount: Math.floor(Math.random() * 50) + 10,
      })),
    )
  }, [categories])

  useEffect(() => {
    const updateSlidesView = () => {
      // Always show 3 slides per view on larger screens
      if (window.innerWidth >= 640) {
        setSlidesPerView(1)
      } else {
        setSlidesPerView(1)
      }
    }

    updateSlidesView()
    window.addEventListener("resize", updateSlidesView)
    return () => window.removeEventListener("resize", updateSlidesView)
  }, [])

  useEffect(() => {
    if (enhancedCategories.length > 0) {
      setTotalSlides(Math.max(1, Math.ceil(enhancedCategories.length / slidesPerView)))
    }
  }, [enhancedCategories.length, slidesPerView])

  // Autoplay functionality
  useEffect(() => {
    const startAutoplay = () => {
      if (totalSlides <= 1) return

      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }

      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)
    }

    startAutoplay()

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [totalSlides, currentSlide])
useEffect(()=>{
  console.log("enhanced categoeis",enhancedCategories)
})
  // Progress bar animation
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%"
      progressRef.current.style.transition = "none"

      setTimeout(() => {
        progressRef.current.style.width = "100%"
        progressRef.current.style.transition = "width 5000ms linear"
      }, 50)
    }
  }, [currentSlide])

  const nextSlide = () => {
    console.log("Moving to next slide", currentSlide, totalSlides)
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      setCurrentSlide(totalSlides - 1)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Touch and mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    const slideWidth = carouselRef.current.offsetWidth

    if (Math.abs(walk) > slideWidth / 4) {
      if (walk > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
      setIsDragging(false)
    }
  }

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    const slideWidth = carouselRef.current.offsetWidth

    if (Math.abs(walk) > slideWidth / 4) {
      if (walk > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
      setIsDragging(false)
    }
  }

  // Function to handle category selection
  const handleCategorySelect = (categoryName) => {
    // Update URL with selected category
    router.push(`?category=${encodeURIComponent(categoryName)}`)

    // Scroll to product section
    setTimeout(() => {
      const productSection = document.getElementById(productSectionId)
      if (productSection) {
        productSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100) // Small delay to ensure URL update happens first
  }

  return (
    <div className="relative px-1 py-6 md:py-8">
      {/* Left navigation button */}
      <Button
        variant="outline"
        size="icon"
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm shadow-sm hidden md:flex"
        disabled={currentSlide === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Right navigation button */}
      <Button
        variant="outline"
        size="icon"
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm shadow-sm hidden md:flex"
        disabled={currentSlide === totalSlides - 1}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <div
        className="overflow-hidden rounded-xl cursor-grab"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div
          className={cn("flex transition-transform duration-500", isDragging ? "ease-out" : "ease-out")}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {enhancedCategories.length > 0 &&
            enhancedCategories.map((category, slideIndex) => (
              <div key={category.id || slideIndex} className="w-full flex-shrink-0">
                <CategoryCard category={category} onSelect={handleCategorySelect} />
              </div>
            ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted mt-4 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-primary rounded-full w-0" />
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300",
                currentSlide === index ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentSlide === index ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ category, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCategoryClick = () => {
    onSelect(category.name)
  }

  return (
    <div
      className="w-full  h-[150px]  md:h-[450px]  relative group cursor-pointer overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCategoryClick}
    >
          <div className="relative w-full h-48"> {/* container defines size */}
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className={cn(
                "object-cover transition-transform duration-700",
                isHovered ? "scale-110" : "scale-100"
              )}
            />
          </div>

      {/* Parallax elements */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500",
          isHovered ? "opacity-95" : "opacity-80",
        )}
      />

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 md:p-6 transition-all duration-500",
          isHovered ? "translate-y-0" : "translate-y-2",
        )}
      >
        <div className="space-y-2">
          <span className="inline-block px-2 py-0.5 bg-primary/20 backdrop-blur-sm text-primary text-xs rounded-full">
            {category.itemCount} items
          </span>

                  <h3
          className={cn(
            "text-white text-xl md:text-2xl font-bold transition-all duration-500",
            "absolute left-3 bottom-4 md:static"
          )}
        >
          {category.name}
        </h3>

          <p
            className={cn(
              "text-white/80 text-sm transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            {category.description}
          </p>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mt-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all gap-1",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Explore
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Interactive overlay effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-0 transition-opacity duration-500",
          isHovered ? "opacity-40" : "opacity-0",
        )}
      />
    </div>
  )
}


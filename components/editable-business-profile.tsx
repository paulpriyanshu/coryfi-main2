"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import {
  Camera,
  Upload,
  Loader2,
  Plus,
  X,
  GripVertical,
  ImageIcon,
  PlusCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createBusinessPage, DeleteBusinessPage, updateBusinessPageLayout } from "@/app/api/business/business"
import { getBusinessPageDetails } from "@/app/api/business/business"
import { addToCategoryCarousel, deleteCategoryFromBusinessPage, getCategoryCarousel } from "@/app/api/business/products"

// Define a type for category
interface Category {
  id: string
  name: string
  color?: string
}

// Define a type for page
interface Page {
  id: string
  businessId: string
  name: string
  description: string
}

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
]
const randomColor = colors[Math.floor(Math.random() * colors.length)]

export default function BusinessProfile({ isMerchant, userId, businessId, pageId }) {
  const router = useRouter()

  // State for business data
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [businessData, setBusinessData] = useState(null)

  // UI states
  const [bannerImage, setBannerImage] = useState<string[]>(["https://placehold.co/1200x300?text=Banner&font=roboto"])
  const [profileImage, setProfileImage] = useState<string>(
    "https://ui-avatars.com/api/?name=BP&background=random&size=128",
  )
  const [businessName, setBusinessName] = useState<string>("")
  const [businessDescription, setBusinessDescription] = useState<string>("")

  // Add upload states for both banner and profile
  const [isBannerUploading, setIsBannerUploading] = useState<boolean>(false)
  const [bannerUploadProgress, setBannerUploadProgress] = useState<number>(0)
  const [isProfileUploading, setIsProfileUploading] = useState<boolean>(false)
  const [profileUploadProgress, setProfileUploadProgress] = useState<number>(0)

  // Category states
  const [categories, setCategories] = useState([])
  const [draggedItem, setDraggedItem] = useState<Category | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]) // Mocked categories
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Modal states
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState<boolean>(false)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState<boolean>(false)
  const [isConfirmDuplicateModalOpen, setIsConfirmDuplicateModalOpen] = useState<boolean>(false)
  const [newPageName, setNewPageName] = useState<string>("")
  const [newPageDescription, setNewPageDescription] = useState<string>("")
  const [selectedPageToDuplicate, setSelectedPageToDuplicate] = useState<Page | null>(null)
  const [isCreatingPage, setIsCreatingPage] = useState<boolean>(false)
  const [addedCategories, setAddedCategories] = useState([])

  // New state to track the current slide
  const [currentSlide, setCurrentSlide] = useState(0)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  // Fetch business details on component mount
  useEffect(() => {
    if (!isMerchant) {
      router.push(`/becomeMerchant/${userId}`)
      return
    }

    async function fetchBusinessDetails() {
      setIsLoading(true)
      try {
        const data = await getBusinessPageDetails(pageId)
        if (data) {
          setBusinessData(data)

          // Pre-fill the form with fetched data
          if (data.pageData) {
            setBannerImage(data.pageData.bannerImageUrls || bannerImage)
            setProfileImage(data.pageData.dpImageUrl || profileImage)
            setBusinessName(data.pageData.name || "")
            setBusinessDescription(data.pageData.description || "")
            setCategories(data.pageData.categories || [])
            console.log("banners", data.pageData.bannerImageUrls)

            // Pre-fill new page modal fields
            setNewPageName(data.pageData.name || "")
            setNewPageDescription(data.pageData.description || "")
          }
        }
      } catch (error) {
        console.error("Error fetching business details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessDetails()
  }, [businessId, isMerchant, router, userId, pageId])

  useEffect(() => {
    // In a real app, you would fetch categories from an API
    async function fetchCategories() {
      try {
        // If we already have categories from the business data, use those
        if (businessData && businessData.pageData && businessData.pageData.categories) {
          setFetchedCategories(businessData.pageData.categories)
        } else {
          // Fallback to mock data if needed
          const mockCategories: Category[] = [
            { id: "1", name: "Category A" },
            { id: "2", name: "Category B" },
            { id: "3", name: "Category C" },
          ]
          setFetchedCategories(mockCategories)
        }
      } catch (error) {
        console.error("Error setting categories:", error)
      }
    }

    fetchCategories()
  }, [businessData])

  const handleBannerClick = () => {
    bannerInputRef.current?.click()
  }

  const handleProfileClick = () => {
    profileInputRef.current?.click()
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsBannerUploading(true)
    setBannerUploadProgress(0)

    try {
      // Create a temporary preview immediately
      const tempPreview = URL.createObjectURL(file)
      // Add to the array instead of replacing
      setBannerImage((prev) => [...prev, tempPreview])

      // Update current slide to show the new image
      setCurrentSlide(bannerImage.length)

      // Start the actual upload
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}_${file.name}`
      const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${uniqueFilename}`)
      const { url, filename } = uploadUrlResponse.data

      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setBannerUploadProgress(percentCompleted)
        },
      })

      // Get the final URL
      const previewResponse = await axios.get(`https://media.coryfi.com/api/image/${filename}`)
      const previewUrl = previewResponse.data.url // Extract the actual image URL

      // Update the state by replacing tempPreview with previewUrl
      setBannerImage((prev) => {
        const updatedImages = prev.map((image) => (image === tempPreview ? previewUrl : image))

        // Update the database with the new image array
        updateBusinessPageLayout(pageId, { bannerImageUrls: updatedImages }).catch((error) =>
          console.error("Failed to update database:", error),
        )

        return updatedImages // Return the updated state
      })

      // Scroll to the newly added image
      setTimeout(() => {
        const carousel = document.getElementById("banner-carousel")
        if (carousel) {
          carousel.scrollTo({
            left: carousel.scrollWidth,
            behavior: "smooth",
          })
        }
      }, 100)
    } catch (error) {
      console.error("Error uploading banner image:", error)
      alert("Failed to upload banner image")

      // Remove the temporary preview on error
      setBannerImage((prev) => prev.filter((img) => img !== tempPreview))
    } finally {
      setIsBannerUploading(false)
      setBannerUploadProgress(0)
      if (e.target) e.target.value = ""
    }
  }

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProfileUploading(true)
    setProfileUploadProgress(0)

    try {
      // Create a temporary preview immediately
      const tempPreview = URL.createObjectURL(file)
      setProfileImage(tempPreview)

      // Start the actual upload
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}_${file.name}`
      const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${uniqueFilename}`)
      const { url, filename } = uploadUrlResponse.data

      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProfileUploadProgress(percentCompleted)
        },
      })

      // Get the final URL
      const previewResponse = await axios.get(`https://media.coryfi.com/api/image/${filename}`)

      const previewUrl = previewResponse.data.url // Adjust this based on the actual response structure

      const updates = {
        dpImageUrl: previewUrl, // Save the preview URL in dpImageUrl or any other field you want to update
      }

      await updateBusinessPageLayout(pageId, updates)
      setProfileImage(previewResponse.data.url)
    } catch (error) {
      console.error("Error uploading profile image:", error)
      alert("Failed to upload profile image")
    } finally {
      setIsProfileUploading(false)
      setProfileUploadProgress(0)
      if (e.target) e.target.value = ""
    }
  }

  const removeCategory = async (categoryId) => {
    try {
      console.log("Removing category:", categoryId)

      await deleteCategoryFromBusinessPage(pageId, categoryId)

      setAddedCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId))

      console.log("Category removed successfully.")
    } catch (error) {
      console.error("Error removing category:", error)

      // Optionally, show an error message to the user
      alert("Failed to remove category. Please try again.")
    }
  }

  const handleDragStart = (category: Category) => {
    setDraggedItem(category)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverItemId(id)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedItem || !dragOverItemId || draggedItem.id === dragOverItemId) {
      setDraggedItem(null)
      setDragOverItemId(null)
      return
    }

    const draggedItemIndex = categories.findIndex((item) => item.id === draggedItem.id)
    const dropItemIndex = categories.findIndex((item) => item.id === dragOverItemId)

    const newCategories = [...categories]
    const [reorderedItem] = newCategories.splice(draggedItemIndex, 1)
    newCategories.splice(dropItemIndex, 0, reorderedItem)

    setCategories(newCategories)
    setDraggedItem(null)
    setDragOverItemId(null)
  }

  // New Page Modal functions
  const openNewPageModal = () => {
    setNewPageName("")
    setNewPageDescription("")
    setIsNewPageModalOpen(true)
  }

  const handleCreateNewPage = async () => {
    if (newPageName.trim() === "") return

    setIsCreatingPage(true)

    try {
      // Create a new page
      const newPage: Page = {
        id: Date.now().toString(),
        businessId,
        name: newPageName.trim(),
        description: newPageDescription.trim(),
      }

      const createdPage = await createBusinessPage(newPage)

      // Close modal and reset form
      setIsNewPageModalOpen(false)
      setNewPageName("")
      setNewPageDescription("")

      // Redirect to the new page
      router.replace(`/dashboard/${businessId}/${createdPage.pageId}`)
    } catch (error) {
      console.error("Error creating page:", error)
    } finally {
      setIsCreatingPage(false)
    }
  }

  // Duplicate Page Modal functions
  const openDuplicateModal = () => {
    setIsDuplicateModalOpen(true)
  }

  const handleSelectPageToDuplicate = (page: Page) => {
    setSelectedPageToDuplicate(page)
    setIsDuplicateModalOpen(false)
    setIsConfirmDuplicateModalOpen(true)
  }

  const handleConfirmDuplicate = () => {
    if (!selectedPageToDuplicate) return
    // Implementation would go here
  }

  const handleCategorySelect = async (categoryid) => {
    // categoryId is string
    const categoryId = Number.parseInt(categoryid)
    console.log("Selected Category ID:", categoryId)
    console.log("Selected Category ID:3", categories)
    if (!categoryId) return

    const selectedCategoryObj = categories.find((cat) => cat.id == categoryId)
    if (!selectedCategoryObj) return
    console.log("Selected Category ID:3", categoryId)
    // Check if the category is already added
    if (!addedCategories?.some((cat) => cat.name === selectedCategoryObj.name)) {
      const newCategoryItem: Category = {
        id: Date.now().toString(), // Create a temporary ID
        name: selectedCategoryObj.name,
        color: randomColor,
      }

      try {
        console.log("Selected Category ID2:", categoryId)
        await addToCategoryCarousel(categoryId, pageId)
      } catch (error) {
        console.error("Error adding to carousel:", error)
        return
      }

      setAddedCategories([...addedCategories, newCategoryItem])
      setSelectedCategory("")
    }
  }

  useEffect(() => {
    async function getAddedCategories(pageId) {
      const data = await getCategoryCarousel(pageId)
      setAddedCategories(data?.categories)
      console.log("added categories", data?.categories)
    }
    getAddedCategories(pageId)
  }, [])

  const removeBannerImage = async (index: number) => {
    setBannerImage((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);
      console.log("updated banner images",updatedImages)
  
      // Update the DB with the latest state
      updateBusinessPageLayout(pageId, {
        name: businessName,
        description: businessDescription,
        bannerImageUrls: updatedImages, // Use the updated state
        dpImageUrl: profileImage,
      });
  
      return updatedImages;
    });
  };

  const saveBusinessProfile = async () => {
    try {
      // Show loading state
      const saveButton = document.getElementById("save-profile-button")
      if (saveButton) {
        saveButton.disabled = true
        saveButton.innerHTML = '<span class="loader"></span> Saving...'
      }

      // Call the update function
      await updateBusinessPageLayout(pageId, {
        name: businessName,
        description: businessDescription,
        bannerImageUrls: bannerImage,
        dpImageUrl: profileImage,
      })

      // Show success message
      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      // Reset button state
      const saveButton = document.getElementById("save-profile-button")
      if (saveButton) {
        saveButton.disabled = false
        saveButton.innerHTML = "Save Profile"
      }
    }
  }
  const handleDeletePage = async (pageId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this page?");
      
      if (!confirmDelete) return; // Exit if user cancels
  
      // Proceed with delete logic here...
      await DeleteBusinessPage(pageId) 

      console.log("Page deleted");
      router.replace(`/dashboard/${businessId}`)
      
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  // Navigation functions for banner carousel
  const goToPrevSlide = () => {
    const carousel = document.getElementById("banner-carousel")
    if (carousel && bannerImage.length > 0) {
      const slideWidth = carousel.clientWidth
      const newPosition = Math.max(carousel.scrollLeft - slideWidth, 0)
      carousel.scrollTo({ left: newPosition, behavior: "smooth" })

      // Update current slide index
      const newIndex = Math.floor(newPosition / slideWidth)
      setCurrentSlide(newIndex)
    }
  }

  const goToNextSlide = () => {
    const carousel = document.getElementById("banner-carousel")
    if (carousel && bannerImage.length > 0) {
      const slideWidth = carousel.clientWidth
      const maxScroll = carousel.scrollWidth - slideWidth
      const newPosition = Math.min(carousel.scrollLeft + slideWidth, maxScroll)
      carousel.scrollTo({ left: newPosition, behavior: "smooth" })

      // Update current slide index
      const newIndex = Math.floor(newPosition / slideWidth)
      setCurrentSlide(newIndex)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading business profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-end m-2">
        <Button className="m-1 px-2 py-1 text-xs md:px-4 md:py-2 md:text-base" onClick={openNewPageModal}>
          <PlusCircle className="mr-2 w-3 h-3 md:h-4 md:w-4" />
          New Page
        </Button>
        <Button className="m-1 px-2 py-1 text-xs md:px-4 md:py-2 md:text-base" onClick={openDuplicateModal}>
          <Copy className="mr-2 w-3 h-3 md:h-4 md:w-4" />
          Duplicate a Page
        </Button>
        <Button className="m-1 px-2 py-1 text-xs md:px-4 md:py-2 md:text-base bg-red-500" onClick={()=>handleDeletePage(pageId)}>
          <Trash className="mr-2 w-3 h-3 md:h-4 md:w-4" />
          Delete Page
        </Button>
      </div>

      {/* Banner Section */}
      <div className="relative w-full overflow-hidden">
        {/* Upload Banner Button - Positioned at top right */}
        <Button
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-lg bg-white/90 hover:bg-white z-20 flex items-center gap-2"
          onClick={handleBannerClick}
          disabled={isBannerUploading}
        >
          {isBannerUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading... {bannerUploadProgress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Banner
            </>
          )}
        </Button>
        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />

        {/* Banner Images Carousel/Grid */}
        <div className="relative aspect-[16/9] md:aspect-[16/9] w-full overflow-hidden">
          {bannerImage.length > 0 ? (
            <div className="relative">
              {/* Wrapping div to prevent overflow */}
              <div className="max-w-full overflow-hidden">
                <div id="banner-carousel" className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full">
                  {bannerImage.map((image, index) => (
                    <div key={index} className="relative min-w-full snap-center">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Banner ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                        onClick={() => removeBannerImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {bannerImage.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/70 hover:bg-white/90 shadow-md z-10"
                    onClick={goToPrevSlide}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/70 hover:bg-white/90 shadow-md z-10"
                    onClick={goToNextSlide}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No banner images</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto w-full px-4 -mt-12 sm:-mt-16 relative z-10">
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-md cursor-pointer group"
                    onClick={handleProfileClick}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-full">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-300"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-6 w-6 sm:h-8 sm:w-8 bg-primary hover:bg-primary/90 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      profileInputRef.current?.click()
                    }}
                    disabled={isProfileUploading}
                  >
                    {isProfileUploading ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-white animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={profileInputRef}
                    onChange={handleProfileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Profile Upload Progress */}
                {isProfileUploading && (
                  <div className="w-full mt-2">
                    <Progress value={profileUploadProgress} className="h-1 sm:h-2" />
                    <p className="text-xs text-center mt-1">{profileUploadProgress}%</p>
                  </div>
                )}
              </div>

              {/* Business Information */}
              <div className="flex-1 space-y-3 sm:space-y-4 mt-4 md:mt-0">
                <div>
                  <label htmlFor="business-name" className="block text-xs sm:text-sm font-medium mb-1">
                    Business Name
                  </Label>
                  <Input
                    id="business-name"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="business-description" className="block text-xs sm:text-sm font-medium mb-1">
                    Business Description
                  </Label>
                  <Textarea
                    id="business-description"
                    placeholder="Describe your business"
                    rows={3}
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="resize-none text-sm"
                  />
                </div>
                <Button
                  id="save-profile-button"
                  className="mt-3 sm:mt-4 w-full sm:w-auto text-sm"
                  onClick={saveBusinessProfile}
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Carousel - Modernized */}
        <Card className="shadow-lg mt-4 sm:mt-6 overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Business Categories</span>
              <Badge variant="outline" className="text-xs font-normal">
                {categories.length} categories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Category Input with Dropdown */}
              <div className="space-y-3">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="category-select" className="text-sm font-medium">
                    Select from existing categories
                  </Label>
                  <div className="flex gap-2">
                    <select
                      id="category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => handleCategorySelect(selectedCategory)}
                      size="sm"
                      className="shrink-0 shadow-sm"
                      disabled={!selectedCategory}
                    >
                      Add Selected
                    </Button>
                  </div>
                </div>
              </div>

              {/* Categories Display */}
              <div className="border rounded-md p-3 bg-muted/30">
                <ScrollArea className="w-full">
                  <div
                    className="flex flex-wrap gap-2 p-1 min-h-[60px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {addedCategories?.length === 0 ? (
                      <div className="w-full flex items-center justify-center p-4 text-center">
                        <div className="text-sm text-muted-foreground bg-background/80 p-3 rounded-lg border border-dashed">
                          <Plus className="h-5 w-5 mx-auto mb-1 opacity-50" />
                          No categories added yet. Add your first category above.
                        </div>
                      </div>
                    ) : (
                      addedCategories?.map((category) => (
                        <motion.div
                          key={category.id}
                          draggable
                          onDragStart={() => handleDragStart(category)}
                          onDragOver={(e) => handleDragOver(e, category.id)}
                          className={`
                            flex items-center gap-1 px-1 py-1 rounded-md border bg-background
                            ${dragOverItemId === category.id ? "border-primary shadow-md" : "border-transparent"}
                            ${draggedItem?.id === category.id ? "opacity-50" : "opacity-100"}
                            transition-all duration-200 hover:shadow-sm
                          `}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center cursor-grab active:cursor-grabbing p-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Badge className={`${randomColor} text-white px-3 py-1 shadow-sm`} variant="secondary">
                            {category.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-destructive/10 ml-1"
                            onClick={() => removeCategory(Number.parseInt(category.id))}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {category.name}</span>
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <GripVertical className="h-3 w-3" />
                  <p>Drag and drop categories to rearrange them</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Page Modal */}
      <Dialog open={isNewPageModalOpen} onOpenChange={setIsNewPageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>Enter the details for your new page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="page-name" className="text-sm font-medium">
                Page Name
              </Label>
              <Input
                id="page-name"
                placeholder="Enter page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="page-description" className="text-sm font-medium">
                Page Description
              </Label>
              <Textarea
                id="page-description"
                placeholder="Enter page description"
                rows={3}
                value={newPageDescription}
                onChange={(e) => setNewPageDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPageModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewPage} disabled={!newPageName.trim() || isCreatingPage}>
              {isCreatingPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Page"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Page Modal */}
      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate a Page</DialogTitle>
            <DialogDescription>Select a page to duplicate.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No pages available to duplicate</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Duplicate Modal */}
      <Dialog open={isConfirmDuplicateModalOpen} onOpenChange={setIsConfirmDuplicateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Duplication</DialogTitle>
            <DialogDescription>Are you sure you want to duplicate this page?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPageToDuplicate && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h3 className="font-medium">{selectedPageToDuplicate.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPageToDuplicate.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDuplicateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDuplicate}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


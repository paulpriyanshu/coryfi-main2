"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Package2Icon,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import React from "react"
import { addToCart } from "@/app/api/business/products" // Update this path to match your actual file structure
import { useSession } from "next-auth/react"
import { fetchUserId } from "@/app/api/actions/media"
// Add these imports at the top with the other imports
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Product({ product, productId }) {
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedFields, setSelectedFields] = useState({})
  const [additionalCost, setAdditionalCost] = useState(0)
  const [counterCost, setCounterCost] = useState(0)
  const [userId, setUserId] = useState(null)
  const [counterItems, setCounterItems] = useState({})
  const [initialCounterValues, setInitialCounterValues] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  // Add a new state for tracking the selected receiveBy option
  const [selectedReceiveBy, setSelectedReceiveBy] = useState(null)

  // Add these new state variables after the other useState declarations
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)

  useEffect(() => {
    async function fetchuserid() {
      if (session?.user?.email) {
        const data = await fetchUserId(session?.user?.email)
        if (data) {
          console.log("data", data)
          setUserId(Number.parseInt(data.id))
        }
      }
    }
    fetchuserid()
  }, [session])

  useEffect(() => {
    if (product?.counter && Array.isArray(product.counter)) {
      const initialCounters = {}
      const initialValues = {}

      product.counter.forEach((item) => {
        // Get the first key from keyValues as the default
        const defaultKey = Object.keys(item.keyValues)[0]
        if (defaultKey) {
          // Check if the keyValue is an object with cost and value
          if (typeof item.keyValues[defaultKey] === "object" && item.keyValues[defaultKey].value !== undefined) {
            // Store just the value, not the whole object
            initialCounters[item.name] = item.keyValues[defaultKey].value
            initialValues[item.name] = item.keyValues[defaultKey].value
          } else {
            // For simple values, store as is
            initialCounters[item.name] = item.keyValues[defaultKey]
            initialValues[item.name] = item.keyValues[defaultKey]
          }
        }
      })

      setCounterItems(initialCounters)
      setInitialCounterValues(initialValues)
      // Don't add any initial counter cost
      setCounterCost(0)
    }
  }, [product])

  const handleProductClick = (newProductId: string) => {
    const newURL = pathname.replace(/[^/]+$/, newProductId) // Replace last segment
    router.replace(newURL) // Update URL without reloading
  }

  // Default values for rating and reviews since they're not in the data structure
  const rating = 4.5
  const reviewCount = 12

  // Calculate total price including any additional costs from selected fields
  const totalPrice = React.useMemo(() => {
    const basePrice = product?.basePrice || 0
    let receiveByCharge = 0

    // Add the charge based on selected receiveBy option
    if (selectedReceiveBy === "DELIVERY" && product?.deliveryCharge) {
      receiveByCharge = product.deliveryCharge
    } else if (selectedReceiveBy === "TAKEAWAY" && product?.takeawayCharge) {
      receiveByCharge = product.takeawayCharge
    } else if (selectedReceiveBy === "DINEIN" && product?.dineinCharge) {
      receiveByCharge = product.dineinCharge
    }

    return basePrice + additionalCost + counterCost + receiveByCharge
  }, [
    product?.basePrice,
    additionalCost,
    counterCost,
    selectedReceiveBy,
    product?.deliveryCharge,
    product?.takeawayCharge,
    product?.dineinCharge,
  ])

  // Group variants by relationType
  const variantsByType = React.useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return {}

    return product.variants.reduce((acc, variant) => {
      const type = variant.relationType || "other"
      if (!acc[type]) acc[type] = []
      acc[type].push(variant)
      return acc
    }, {})
  }, [product?.variants])

  const handleFieldSelection = (field, key, value) => {
    // Create a copy of current selections
    const newSelectedFields = { ...selectedFields }

    // If this field was already selected with the same key, deselect it
    if (newSelectedFields[field.name] && newSelectedFields[field.name].key === key) {
      // If field type is "Cost", remove its cost contribution
      if (field.type === "Cost" && !isNaN(Number(value))) {
        setAdditionalCost((prev) => prev - Number(value))
      }
      // Remove the selection
      delete newSelectedFields[field.name]
    } else {
      // If this field was already selected with a different key, remove its previous cost contribution
      if (newSelectedFields[field.name] && field.type === "Cost") {
        const previousKey = newSelectedFields[field.name].key
        const previousValue = field.keyValues[previousKey]
        if (!isNaN(Number(previousValue))) {
          setAdditionalCost((prev) => prev - Number(previousValue))
        }
      }

      // Update selection
      newSelectedFields[field.name] = { key, value }

      // If field type is "Cost", add the value to the price
      if (field.type === "Cost" && !isNaN(Number(value))) {
        const numValue = Number(value)
        setAdditionalCost((prev) => prev + numValue)
      }
    }

    setSelectedFields(newSelectedFields)
  }

  // Add a new function to handle clearing a field selection
  const clearFieldSelection = (fieldName) => {
    // Create a copy of current selections
    const newSelectedFields = { ...selectedFields }

    // If this field has a selection
    if (newSelectedFields[fieldName]) {
      // If field type is "Cost", remove its cost contribution
      const field = product.fields.find((f) => f.name === fieldName)
      if (field && field.type === "Cost") {
        const key = newSelectedFields[fieldName].key
        const value = field.keyValues[key]
        if (!isNaN(Number(value))) {
          const numValue = Number(value)
          setAdditionalCost((prev) => prev - numValue)
        }
      }

      // Remove the selection
      delete newSelectedFields[fieldName]
      setSelectedFields(newSelectedFields)
    }
  }

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const nextImage = () => {
    if (!product?.images?.length) return
    setCurrentImage((currentImage + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product?.images?.length) return
    setCurrentImage((currentImage - 1 + product.images.length) % product.images.length)
  }

  // Completely rewritten counter change handler
  const handleCounterChange = (counterName, increment) => {
    // Find the counter item in the product data
    const counterItem = product?.counter?.find((item) => item.name === counterName)
    if (!counterItem) return

    // Get the first key from keyValues as we're using it for the counter
    const key = Object.keys(counterItem.keyValues)[0]
    if (!key) return

    // Check if the keyValues has a cost field
    const hasCustomCost =
      counterItem.keyValues[key] &&
      typeof counterItem.keyValues[key] === "object" &&
      counterItem.keyValues[key].cost !== undefined

    if (!hasCustomCost) return

    // Get cost per item
    const costPerItem = counterItem.keyValues[key].cost

    // Get initial value for this counter
    const initialValue = initialCounterValues[counterName] || 0

    // Get current value
    const currentValue = counterItems[counterName] || 0

    // Calculate new value
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1)

    // Update counter items state
    setCounterItems((prev) => ({
      ...prev,
      [counterName]: newValue,
    }))

    // Calculate cost adjustment
    if (increment) {
      // Only add cost if we're increasing above the initial value
      if (currentValue >= initialValue) {
        setCounterCost((prev) => prev + costPerItem)
      }
    } else {
      // Only subtract cost if we're decreasing but still above the initial value
      if (currentValue > initialValue) {
        setCounterCost((prev) => prev - costPerItem)
      }
    }
  }

  // Add this useEffect to show/hide the date time picker based on receiveBy selection
  useEffect(() => {
    if (selectedReceiveBy === "DINEIN" || selectedReceiveBy === "TAKEAWAY") {
      setShowDateTimePicker(true)

      // Set default to today's date
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = (today.getMonth() + 1).toString() // JavaScript months are 0-indexed
      const currentDay = today.getDate().toString()

      setSelectedYear(currentYear.toString())
      setSelectedMonth(currentMonth)
      setSelectedDay(currentDay)
    } else {
      setShowDateTimePicker(false)
      setSelectedDay("")
      setSelectedMonth("")
      setSelectedYear("")
      setSelectedTimeSlot(null)
    }
  }, [selectedReceiveBy])

  // Add these time slots
  const timeSlots = [
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM",
  ]

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 2 }, (_, i) => (currentYear + i).toString())

  // Function to check if the selected date is valid
  const isDateValid = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return false

    const day = Number.parseInt(selectedDay)
    const month = Number.parseInt(selectedMonth)
    const year = Number.parseInt(selectedYear)

    // Check if date is valid
    const date = new Date(year, month - 1, day)

    // Check if the date is today or in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year && date >= today
  }

  // Function to get formatted date string
  const getFormattedDate = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return null

    // Format as YYYY-MM-DD
    const month = selectedMonth.padStart(2, "0")
    const day = selectedDay.padStart(2, "0")
    return `${selectedYear}-${month}-${day}`
  }

  // Function to get readable date
  const getReadableDate = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return ""

    const monthName = months.find((m) => m.value === selectedMonth)?.label || ""
    return `${monthName} ${selectedDay}, ${selectedYear}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Main Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Product Images */}
        <div className="relative lg:col-span-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product?.images?.[currentImage] || "/placeholder.svg"}
              alt={product?.name || "Product image"}
              fill
              className="object-cover transition-all"
            />
            {product?.images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}
          </div>
          {product?.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-md ${
                    index === currentImage ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setCurrentImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold sm:text-3xl">{product?.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          <div className="mt-4">
            <span className="text-2xl font-bold">₹{totalPrice.toFixed(2)}</span>
            <span className="ml-2 text-sm text-muted-foreground">Tax included</span>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            {product?.description && (
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product?.category && (
              <div>
                <h3 className="mb-2 font-medium">Category</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-auto px-4 py-2">
                    {product.category.name}
                  </Button>
                </div>
              </div>
            )}

            {/* Variants grouped by relationType */}
            {Object.entries(variantsByType).map(([relationType, variants]) => (
              <div key={relationType}>
                <h3 className="mb-2 font-medium capitalize">{relationType}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        // Toggle selection - if already selected, deselect it
                        setSelectedVariant(selectedVariant === index ? null : index)
                      }}
                      className={`cursor-pointer rounded-md border p-2 transition-all hover:border-primary ${
                        index === selectedVariant ? "border-primary ring-1 ring-primary" : "border-muted"
                      } ${variant.product.stock <= 0 ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-2" onClick={() => handleProductClick(variant.product.id)}>
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={variant.product.images?.[0] || "/placeholder.svg"}
                            alt={variant.product.name || "Product variant"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{variant.product.name}</p>
                          <p className="text-xs text-muted-foreground">{variant.description}</p>
                          {variant.product.stock <= 0 && (
                            <p className="text-xs font-medium text-destructive">Out of stock</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Product Fields Selection - Updated for new field structure */}
            {product?.fields && product.fields.length > 0 && (
              <div>
                {product.fields.map((field) => (
                  <div key={field.id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium capitalize">{field.name}</h3>
                      {selectedFields[field.name] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearFieldSelection(field.name)
                          }}
                          className="text-xs h-7 px-2"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {Object.entries(field.keyValues).map(([key, value]) => (
                        <div
                          key={key}
                          onClick={() => handleFieldSelection(field, key, value)}
                          className={`cursor-pointer rounded-md border p-2 text-center transition-all hover:border-primary ${
                            selectedFields[field.name]?.key === key
                              ? "border-primary ring-1 ring-primary"
                              : "border-muted"
                          }`}
                        >
                          <p className="text-sm">
                            {key}
                            {field.type === "Cost" && !isNaN(Number(value)) && field.showCost ? ` (₹${value})` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Counter Items */}
            {product?.counter && product.counter.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Add Ons</h3>
                {product.counter.map((counterItem) => {
                  // Get the first key from keyValues as the item name
                  const itemName = Object.keys(counterItem.keyValues)[0]
                  return (
                    <div key={counterItem.id} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium capitalize">{itemName}</span>
                          {counterItem.description && (
                            <p className="text-xs text-muted-foreground">{counterItem.description}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCounterChange(counterItem.name, false)}
                            disabled={counterItems[counterItem.name] <= Object.values(counterItem.keyValues)[0]?.value}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease {itemName}</span>
                          </Button>
                          <span className="w-10 text-center">{counterItems[counterItem.name] || 0}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCounterChange(counterItem.name, true)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase {itemName}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div>
              <h3 className="mb-2 font-medium">Quantity</h3>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>
            <div className="flex justify-start">
              <Package2Icon />
              Stock : {product.stock}
            </div>
            <div>
              {product.stock <= 3 && product.stock > 0 && (
                <div className="text-red-500">Only {product.stock} left in the stock !!</div>
              )}
            </div>
            
            <div>{product.stock === 0 && <div className="text-red-500">Out of Stock !!</div>}</div>

            {/* Add this UI component after the Quantity section and before the Add to Cart button */}
            <div>
              <h3 className="mb-2 font-medium">Receive By</h3>
              <div className="grid grid-cols-2 gap-3">
                {product?.recieveBy?.map((method) => (
                  <div
                    key={method}
                    onClick={() => setSelectedReceiveBy(selectedReceiveBy === method ? null : method)}
                    className={`cursor-pointer rounded-md border p-2 text-center transition-all hover:border-primary ${
                      selectedReceiveBy === method ? "border-primary ring-1 ring-primary" : "border-muted"
                    }`}
                  >
                    <p className="text-sm">
                      {method}
                      {method === "DELIVERY" && product.deliveryCharge != null && ` (₹${product.deliveryCharge})`}
                      {method === "TAKEAWAY" && product.takeawayCharge != null && ` (₹${product.takeawayCharge})`}
                      {method === "DINEIN" && product.dineinCharge != null && ` (₹${product.dineinCharge})`}
                    </p>
                  </div>
                ))}
              </div>
              {!selectedReceiveBy && product?.recieveBy?.length > 0 && (
                <p className="text-xs text-destructive mt-1">Please select a delivery method</p>
              )}
            </div>
            {showDateTimePicker && (
              <div className="mt-4 space-y-4">
                <h3 className="font-medium">{selectedReceiveBy === "DINEIN" ? "Dine-in" : "Pickup"} Details</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select Date</Label>
                    <div className="flex flex-wrap gap-2">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(selectedMonth || selectedDay || selectedYear) && !isDateValid() && (
                      <p className="text-xs text-destructive mt-1">Please select a valid date (today or future date)</p>
                    )}
                    {selectedMonth && selectedDay && selectedYear && isDateValid() && (
                      <p className="text-xs text-muted-foreground mt-1">Selected: {getReadableDate()}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-slot">Select Time Slot</Label>
                    <Select
                      value={selectedTimeSlot || ""}
                      onValueChange={setSelectedTimeSlot}
                      disabled={!isDateValid()}
                    >
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Select time">
                          {selectedTimeSlot ? (
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {selectedTimeSlot}
                            </div>
                          ) : (
                            "Select time"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isDateValid() && !selectedTimeSlot && (
                      <p className="text-xs text-destructive">Please select a time slot</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          <div className="text-red-500">Online orders coming soon!!</div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                disabled={
                  product?.stock <= 0 ||
                  !product?.recieveBy ||
                  !selectedReceiveBy ||
                  ((selectedReceiveBy === "DINEIN" || selectedReceiveBy === "TAKEAWAY") &&
                    (!isDateValid() || !selectedTimeSlot))
                }
                onClick={async () => {
                  // Prepare cart item with selected customizations
                  const customizations = Object.entries(selectedFields).map(([fieldName, selection]) => {
                    // Find the field to get the first key from keyValues instead of using the field name
                    const field = product.fields.find((f) => f.name === fieldName)
                    return `${selection.key}` // Just use the selected key, not the field name
                  })

                  // Add counter items to customizations
                  const counterCustomizations = Object.entries(counterItems)
                    .filter(([name, count]) => count > 0)
                    .map(([name, count]) => {
                      // Find the counter item to get the first key from keyValues
                      const counterItem = product.counter.find((c) => c.name === name)
                      if (counterItem) {
                        const key = Object.keys(counterItem.keyValues)[0]
                        return `${key}: ${count}` // Use the item name (key) instead of counter name
                      }
                      return ""
                    })
                    .filter((item) => item !== "") // Remove any empty strings

                  const allCustomizations = [...customizations, ...counterCustomizations]

                  // Update the Add to Cart button onClick handler to include the receiveBy information
                  // Find the onClick handler for the Add to Cart button and modify the cartItem object creation
                  const cartItem = {
                    productId: product.id,
                    name: product.name,
                    price: totalPrice,
                    basePrice:product.basePrice,
                    fields: selectedFields,
                    customization: allCustomizations.join(", ") || "Normal",
                    counterItems: Object.entries(counterItems).reduce((acc, [counterName, count]) => {
                      // Find the counter item to get the first key from keyValues
                      const counterItem = product.counter.find((c) => c.name === counterName)
                      if (counterItem) {
                        const key = Object.keys(counterItem.keyValues)[0]
                        // Only include counter items that have been changed from their initial value
                        const initialValue = initialCounterValues[counterName] || 0
                        if (count > initialValue) {
                          // Include both count and cost in the object
                          acc[key] = {
                            count: count,
                            default:initialValue,
                            cost: counterItem.keyValues[key].cost || 0,
                          }
                        }
                      }
                      return acc
                    }, {}),
                    recieveBy: selectedReceiveBy
                      ? {
                          type: selectedReceiveBy,
                          charge:
                            selectedReceiveBy === "DELIVERY"
                              ? product.deliveryCharge
                              : selectedReceiveBy === "TAKEAWAY"
                                ? product.takeawayCharge
                                : product.dineinCharge,
                          
                        }
                      : null,
                    scheduledDateTime:
                      (selectedReceiveBy === "DINEIN" || selectedReceiveBy === "TAKEAWAY") && isDateValid()
                        ? {
                            date: getFormattedDate(),
                            timeSlot: selectedTimeSlot,
                          }
                        : null,
                  }

                  try {
                    // Get user ID (you'll need to implement user authentication)
                    // Replace with actual user ID from your auth system

                    // Add to cart
                    await addToCart(
                      userId,
                      Array.from({ length: quantity }, () => cartItem),
                    )

                    // Show success message
                    alert("Product added to cart successfully!")
                  } catch (error) {
                    console.error("Failed to add to cart:", error)
                    alert("Failed to add to cart. Please try again.")
                  }
                }}
              >
                
                <ShoppingCart className="h-5 w-5" />
                {product?.stock <= 0
                  ? "Out of Stock"
                  : !selectedReceiveBy
                    ? "Select delivery method"
                    : (selectedReceiveBy === "DINEIN" || selectedReceiveBy === "TAKEAWAY") &&
                        (!isDateValid() || !selectedTimeSlot)
                      ? `Select ${!isDateValid() ? "valid date" : "time slot"}`
                      : "Add to Cart"}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share product</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="features">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="mt-6">
            {product?.features ? (
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {product?.description || "No features available."}
              </p>
            )}
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product?.specs &&
                Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              {!product?.specs && (
                <div className="col-span-full">
                  <p className="text-muted-foreground">Product Specifications:</p>
                  {product?.SKU && (
                    <div className="mt-4 flex justify-between border-b pb-2">
                      <span className="font-medium">SKU</span>
                      <span className="text-muted-foreground">{product.SKU}</span>
                    </div>
                  )}
                  {product?.category && (
                    <div className="mt-2 flex justify-between border-b pb-2">
                      <span className="font-medium">Category</span>
                      <span className="text-muted-foreground">{product.category.name}</span>
                    </div>
                  )}
                  {product?.stock !== undefined && (
                    <div className="mt-2 flex justify-between border-b pb-2">
                      <span className="font-medium">Stock</span>
                      <span className="text-muted-foreground">{product.stock} available</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedFields && Object.keys(selectedFields).length > 0 && (
              <>
                <h3 className="mt-4 mb-2 font-medium">Selected Options</h3>
                {Object.entries(selectedFields).map(([fieldName, selection]) => (
                  <div key={fieldName} className="mt-2 flex justify-between border-b pb-2">
                    <span className="font-medium capitalize">{fieldName}</span>
                    <span className="text-muted-foreground">{selection.key}</span>
                  </div>
                ))}
              </>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{rating}</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {reviewCount} reviews</p>
                </div>
              </div>
              <Button>Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {product?.variants && product.variants.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {product.variants.map((variant, index) => (
              <Card key={index} className="overflow-hidden dark:bg-black dark:text-white">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={variant.product.images?.[0] || "/placeholder.svg"}
                    alt={variant.product.name || "Related product"}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{variant.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{variant.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">₹{variant.product.basePrice?.toFixed(2) || "0.00"}</span>
                    <Button variant="ghost" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Product

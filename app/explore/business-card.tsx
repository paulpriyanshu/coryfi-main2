// BusinessCardServer.tsx (Server Component)
import Image from "next/image"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ViewBusinessButton from "./businessbutton" // Import the client component

interface Business {
  id: number
  name: string
  category: string
  rating: number
  reviews: number
  image: string
  location: string
  featured?: boolean
}

export default async function BusinessCard({ business, categoryName }) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative  aspect-video">
        <Image
          src={business.dpImageUrl || "/placeholder.svg"}
          alt={business.name}
          fill
          className="object-contain bg-gray-100 transition-transform group-hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-2 py-0 text-xs">{categoryName}</Badge>
        </div>
        <CardTitle className="mt-2 text-lg">{business.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {business.location}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {/* The button is a client component */}
        <ViewBusinessButton business={business} />
      </CardFooter>
    </Card>
  )
}
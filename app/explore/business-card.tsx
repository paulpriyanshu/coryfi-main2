import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Business {
  id: number
  name: string
  category: string
  rating: number
  reviews: number
  image: string
  location: string
  featured?: boolean
  pageId: string
  dpImageUrl?: string
}

interface BusinessCardProps {
  business: Business
  categoryName: string
}


export default async function BusinessCard({ business, categoryName }) {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg border border-border/40 h-full flex flex-col">
      <Link
        href={`https://testing.coryfi.com/explore/business/${encodeURI(business.name)}/${business.pageId}`}
        className="flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <Image
            src={business.dpImageUrl || "/placeholder.svg"}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {categoryName && (
            <Badge variant="secondary" className="absolute top-3 left-3 z-20 bg-background/80 backdrop-blur-sm">
              {categoryName}
            </Badge>
          )}
          {business.featured && (
            <Badge variant="default" className="absolute top-3 right-3 z-20">
              Featured
            </Badge>
          )}
        </div>

        <CardHeader className="p-4 pb-2 flex-grow">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {business.name}
          </h3>

          {business.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{business.rating}</span>
              {business.reviews && <span className="text-sm text-muted-foreground">({business.reviews})</span>}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-2 pt-0">
          {business.location && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{business.location}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-1 mt-auto">
          <div className="w-full">
            <div className="text-xs font-medium text-primary flex items-center justify-end group-hover:underline">
              View business
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 h-3 w-3"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}


import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Individual Business Card Skeleton
export function BusinessCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col dark:bg-slate-900">
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Skeleton className="absolute top-3 left-3 h-5 w-20" />
      </div>

      <CardHeader className="p-4 pb-2 flex-grow">
        {/* Title placeholder */}
        <Skeleton className="h-6 w-4/5" />

        {/* Rating placeholder */}
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-8" />
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {/* Location placeholder */}
        <div className="flex items-center">
          <Skeleton className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="w-full">
          <div className="flex items-center justify-end">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// Grid of Business Card Skeletons
export function BusinessCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <BusinessCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Feed Post Skeletons
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      {/* Post composer skeleton */}
      <Card className="w-full dark:bg-slate-900">
        <CardHeader className="p-4 flex flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-full rounded-md" />
        </CardHeader>
        <CardContent className="p-4 pt-0 flex justify-end gap-2">
          <Skeleton className="h-9 w-24" />
        </CardContent>
      </Card>

      {/* Feed posts skeletons */}
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full dark:bg-slate-900">
          <CardHeader className="p-4 flex flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />

            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// People List Sidebar Skeleton
export function PeopleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card className="w-full dark:bg-slate-900">
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
        <div className="pt-2 flex justify-center">
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

// Profile Sidebar Skeleton
export function ProfileSkeleton() {
  return (
    <Card className="w-full dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile User List Skeleton (horizontal scrolling)
export function MobileUserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 w-16">
            <Skeleton className="h-16 w-16 rounded-full dark:bg-slate-900" />
            <Skeleton className="h-4 w-14 dark:bg-slate-900" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Loading Component
export default function Loading() {
  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-4 space-y-6">
          {/* Mobile user list */}
          <MobileUserListSkeleton count={5} />

          {/* Mobile feed */}
          <FeedSkeleton count={3} />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block container mx-auto py-6">
        <div className="grid grid-cols-[300px_1fr_300px] gap-6">
          {/* Left sidebar - People list */}
          <div>
            <PeopleListSkeleton />
          </div>

          {/* Main content */}
          <div>
            {/* Feed posts */}
            <FeedSkeleton />

            {/* Business cards section */}
            <div className="mt-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <BusinessCardGridSkeleton count={4} />
            </div>
          </div>

          {/* Right sidebar - Profile */}
          <div>
            <div className="sticky top-6">
              <ProfileSkeleton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Business Card Skeleton for specific use cases
export function BusinessCardSkeletonPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <BusinessCardGridSkeleton count={12} />
    </div>
  )
}


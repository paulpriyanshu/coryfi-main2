import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import Link from "next/link"
export function BusinessPageGrid({ pages,businessId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page) => (
        <BusinessPageCard key={page.id} page={page} businessId={businessId} />
      ))}
    </div>
  )
}

export function BusinessPageList({ pages ,businessId}) {
  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <BusinessPageListItem key={page.id} page={page} businessId={businessId}/>
      ))}
    </div>
  )
}

function BusinessPageCard({ page ,businessId}) {
    // console.log("pages",page)
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full bg-muted">
          <img src={page.dpImageUrl || "/placeholder.svg"} alt={page.name} className="object-cover w-full h-full" />
          <div className="absolute top-2 right-2">
            <PageActions />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl">{page.name}</CardTitle>
          <StatusBadge status={page.status} />
        </div>
        <CardDescription className="line-clamp-2 mb-4">{page.description}</CardDescription>
        {/* <div className="flex justify-between text-sm text-muted-foreground">
          <span>Updated {page.lastUpdated}</span>
          <span>{page.views.toLocaleString()} views</span>
        </div> */}
      </CardContent>
      <CardFooter className="pt-0 px-6 pb-6">
               <Link href={`/dashboard/${businessId}/${page.pageId}`} passHref>
                    <Button asChild variant="outline" className="w-full">
                        <span>Edit</span>
                    </Button>
                </Link>
      </CardFooter>
    </Card>
  )
}

function BusinessPageListItem({ page,businessId }) {
    console.log("business",businessId,page.pageId)
  return (
    <Card>
      <div className="flex items-center p-4">
        <div className="h-12 w-12 mr-4 rounded overflow-hidden bg-muted flex-shrink-0">
          <img src={page.image || "/placeholder.svg"} alt={page.name} className="object-cover w-full h-full" />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium truncate">{page.name}</h3>
            <StatusBadge status={page.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate">{page.description}</p>
        </div>
        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        <Link href={`/dashboard/${businessId}/${page.pageId}`} passHref>
  <Button asChild variant="outline" size="sm">
    <span>Edit</span>
  </Button>
</Link>
          
          <PageActions />
        </div>
      </div>
    </Card>
  )
}

function StatusBadge({ status }) {
  return <Badge>{status}</Badge>
}

function PageActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
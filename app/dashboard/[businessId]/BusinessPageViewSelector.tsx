"use client"

import { useState } from "react"
import { Search, Grid3X3, List, Plus } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { BusinessPageList, BusinessPageGrid } from "./BusinessPageViews"

export function BusinessPageViewSelector({ businessPages,businessId }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter business pages based on search
  const filteredPages = businessPages.filter(
    (page) =>
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-auto max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pages..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Page
          </Button>
        </div>
      </div>

      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No business pages found.</p>
        </div>
      ) : viewMode === "grid" ? (
        <BusinessPageGrid pages={filteredPages} businessId={businessId} />
      ) : (
        <BusinessPageList pages={filteredPages}  businessId={businessId}/>
      )}
    </>
  )
}
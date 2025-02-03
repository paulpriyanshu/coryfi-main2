'use client'
import { useState } from "react"
export function ShowMoreButton() {
    const [showFullContent, setShowFullContent] = useState(false)
  
    return (
      <button
        className="text-blue-500 font-semibold hover:underline ml-2"
        // onClick={(e) => {
        //   e.stopPropagation()
        //   setShowFullContent(!showFullContent)
        // }}
      >
        {showFullContent ? "Show less" : "...more"}
      </button>
    )
  }
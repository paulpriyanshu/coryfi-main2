"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ViewBusinessButton({ business }) {


  return (
    <Link href={`https://testing.coryfi.com/explore/business/${encodeURI(business.name)}/${business.pageId}`}>
    <Button variant="outline" size="sm" className="w-full">
      View Business
    </Button>
    </Link>
  )
}
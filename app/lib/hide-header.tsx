"use client"
import { usePathname } from 'next/navigation';
import React from 'react'

function Hideheader() {
  const pathname=usePathname()
  const hiddenRoutes=["/c"]
  const shouldHideFooter = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideFooter) return null;
  return true
}

export default Hideheader
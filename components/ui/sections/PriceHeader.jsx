"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navItems = [
  { name: "Home", href: "/" },
  { name: "Blogs", href: "/blogs" },
  { name: "Docs", href: "/docs" },
  { name: "About Us", href: "/about" },
]

export default function PriceHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [gradientAngle, setGradientAngle] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGradientAngle((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(intervalId)
  }, [])

  const getGradientStyle = () => {
    const color1 = `hsl(240, 100%, 15%)`
    const color2 = `hsl(260, 100%, 10%)`
    const color3 = `hsl(280, 100%, 20%)`
    const color4 = `hsl(300, 100%, 15%)`

    return {
      background: `
        linear-gradient(
          ${gradientAngle}deg,
          ${color1},
          ${color2},
          ${color3},
          ${color4}
        )
      `,
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 15s ease infinite',
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ease-in-out" style={getGradientStyle()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <img
              src="logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="ml-2 text-xl font-bold text-white">Coryfi</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Try Now
            </button>
            <button
              className="md:hidden ml-4 text-white hover:text-purple-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-200 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
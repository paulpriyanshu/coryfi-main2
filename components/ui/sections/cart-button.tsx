"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCartsByUserId } from "@/app/api/business/products"
import { useRouter } from "next/navigation"

export default function CartButton({ userId }) {
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  // const userid = parseInt(userId)

  useEffect(() => {
    async function fetchCart() {
      try {
        const cart = await getCartsByUserId(userId)
        if (cart && cart.cartItems) {
          setCartItemCount(cart.productIds.length)
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
    const interval = setInterval(fetchCart, 5000)
    return () => clearInterval(interval)
  }, [userid])

  const handleCartClick = () => {
    router.push("/cart")
  }

  return (
    <Button
      variant="ghost" // no fixed background, blends anywhere
      size="icon"
      onClick={handleCartClick}
      className="relative text-gray-800 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartItemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium shadow-md">
          {cartItemCount}
        </span>
      )}
      <span className="sr-only">View cart</span>
    </Button>
  )
}
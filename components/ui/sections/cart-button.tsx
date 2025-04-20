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
  const userid = parseInt(userId)

  console.log("user id", userid)

  useEffect(() => {
    async function fetchCart() {
      try {
        const cart = await getCartsByUserId(userid)
        console.log("user cart",cart)
        if (cart && cart.cartItems) {
          setCartItemCount(cart.productIds.length)
          // console.log(cart.cartItems.length)
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Call the function every 5 seconds
    fetchCart() // Initial call
    const interval = setInterval(fetchCart, 5000)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [userid])

  const handleCartClick = () => {
    router.push("/cart")
  }

  return (
    <Button variant="outline" size="icon" className="relative" onClick={handleCartClick}>
      <ShoppingCart className="h-5 w-5" />
      {cartItemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {cartItemCount}
        </span>
      )}
      <span className="sr-only">View cart</span>
    </Button>
  )
}
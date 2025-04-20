"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCartsByUserId, updateCart, moveCartToOrder } from "@/app/api/business/products"

export default function CartDisplay({ userId = "user-123" }) {
  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const userCart = await getCartsByUserId(userId)
        setCart(userCart)
      } catch (error) {
        console.error("Failed to fetch cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [userId])

  const handleRemoveItem = async (itemIndex) => {
    if (!cart) return

    try {
      const updatedItems = [...cart.cartItems]
      updatedItems.splice(itemIndex, 1)

      const updatedCart = await updateCart(cart.id, updatedItems, cart.address)

      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const handleUpdateQuantity = async (itemIndex, newQuantity) => {
    if (!cart || newQuantity < 1) return

    try {
      const updatedItems = [...cart.cartItems]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: newQuantity,
      }

      const updatedCart = await updateCart(cart.id, updatedItems, cart.address)

      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const handleCheckout = async () => {
    if (!cart) return

    try {
      setIsProcessing(true)
      // await moveCartToOrder(cart.id)
      setCart(null)
    } catch (error) {
      console.error("Failed to checkout:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {cart.cartItems.map((item, index) => (
          <div key={index} className="grid gap-4 md:grid-cols-[120px_1fr] items-start">
            <div className="aspect-square overflow-hidden rounded-md">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={120}
                height={120}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-1">
              <h3 className="font-medium">{item.name}</h3>
              {item.variant && <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>}
              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {item.selectedOptions.map((option, i) => (
                    <p key={i}>
                      {option.name}: {option.key}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <div className="ml-auto font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cart.totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{cart.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-2">
          <Button className="w-full" onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Checkout"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}


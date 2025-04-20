"use server"

import { updateCart } from "../api/business/products"
import { revalidatePath } from "next/cache" // Import revalidation function

export async function decreaseQuantity(cartId: any, cartItems: any[], item: any, address: any) {
  if (item.quantity > 1) {
    // Find all instances of this product in the cart
    const itemsWithSameId = cartItems.filter((cartItem) => cartItem.id === item.productId)

    // Remove one instance of the item
    const updatedCartItems = [...cartItems]
    const indexToRemove = updatedCartItems.findIndex((cartItem) => cartItem.id === item.id)

    if (indexToRemove !== -1) {
      updatedCartItems.splice(indexToRemove, 1)
      await updateCart(cartId, updatedCartItems, address)
      
      // ✅ Revalidate cart page
      revalidatePath("/cart")
    }
  }
}

export async function increaseQuantity(cartId: any, cartItems: any[], item: any, address: any) {
  console.log("hey there")
  const quantity = cartItems.filter((product) => product.id === item.id)
  console.log("quantity", quantity)
  console.log("quantity length", quantity.length)

  if (quantity.length < item.stock) {
    // Add another instance of this item to the cart
    const itemToDuplicate = cartItems.find((cartItem) => cartItem.id === item.id)

    if (itemToDuplicate) {
      const updatedCartItems = [...cartItems, { ...itemToDuplicate }]
      await updateCart(cartId, updatedCartItems, address)

      // ✅ Revalidate cart page
      revalidatePath("/cart")

      return true
    }
  }
}

export async function removeItem(cartId: any, cartItems: any[], productId: number, address: any) {
  // Remove all instances of this product from the cart
  const updatedCartItems = cartItems.filter((cartItem) => cartItem.id !== productId)
  console.log("this is updated cart ", updatedCartItems, productId)

  await updateCart(cartId, updatedCartItems, address)

  // ✅ Revalidate cart page
  revalidatePath("/cart")
}
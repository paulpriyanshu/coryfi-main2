import Link from "next/link"
import { ShoppingBag, User } from "lucide-react"


export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Your Store
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              0
            </span>
          </Link>
          <Link href="/account">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

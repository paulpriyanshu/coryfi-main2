import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
        <div className="w-5"></div>
      </div>
    </header>
  )
}


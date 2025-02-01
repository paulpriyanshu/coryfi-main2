import Image from "next/image"
import { Input } from "@/components/ui/Input"
// import { Label } from "@/components/ui/label"
import { Label } from "./ui/Label"
import type React from "react" // Added import for React

interface EditableImageProps {
  src: string
  alt: string
  isEditing: boolean
  onUpdate: (value: string) => void
  className?: string
}

export function EditableImage({ src, alt, isEditing, onUpdate, className }: EditableImageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.value)
  }

  return (
    <div className="relative">
      <Image src={src || "/placeholder.svg"} alt={alt} width={300} height={300} className={className} />
      {isEditing && (
        <div className="mt-2">
          <Label htmlFor="image-url">Image URL</Label>
          <Input id="image-url" type="text" value={src} onChange={handleChange} placeholder="Enter image URL" />
        </div>
      )}
    </div>
  )
}


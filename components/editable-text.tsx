import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"

interface EditableTextProps {
  value: string
  isEditing: boolean
  onUpdate: (value: string) => void
  className?: string
  multiline?: boolean
}

export function EditableText({ value, isEditing, onUpdate, className, multiline = false }: EditableTextProps) {
  const [editValue, setEditValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
    onUpdate(e.target.value)
  }

  if (isEditing) {
    return multiline ? (
      <Textarea value={editValue} onChange={handleChange} className={className} />
    ) : (
      <Input type="text" value={editValue} onChange={handleChange} className={className} />
    )
  }

  return <div className={className}>{value}</div>
}


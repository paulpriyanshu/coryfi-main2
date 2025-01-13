import React from 'react'
import { Upload } from 'lucide-react'

interface ImageUploaderProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer">
                <Upload className="mx-auto text-gray-400" size={24} />
                <p className="mt-2 text-sm text-gray-500">Click or drag to upload an image</p>
            </div>
        </div>
    )
}


'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Loader2, Router, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { uploadPost } from "@/app/api/actions/media"

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="h-32 w-full bg-muted animate-pulse rounded-md" />
})
import "react-quill/dist/quill.snow.css"
import { useRouter } from "next/navigation"

interface ContentCreatorProps {
  userId: string
  maxImages?: number
}

export default function ContentCreator({ userId, maxImages = 4 }: ContentCreatorProps) {
  const [content, setContent] = useState("")
  const [images, setImages] = useState<{ url: string; filename: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()
  const router=useRouter()

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadHeic2Any = async () => {
    const module = await import('heic2any')
    return module.default
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    
    // Prevent uploading more than 4 images at once
    if (images.length + files.length > 5) {
      showNotification('You can only upload up to 5 images per post', 'error')
      return
    }
  
    // Process each file sequentially
    for (const file of files) {
      setIsUploading(true)
      setUploadProgress(0)
  
      try {
        let imageToProcess = file
        
        if (file.type === 'image/heic') {
          try {
            const heic2any = await loadHeic2Any()
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg'
            })
            imageToProcess = new File([convertedBlob], file.name.replace('.heic', '.jpg'), { 
              type: 'image/jpeg' 
            })
            
          } catch (error) {
            console.error('Error converting HEIC image:', error)
            continue
          }
        }
  
        // Create unique filename using timestamp
        const timestamp = Date.now()
        const uniqueFilename = `${timestamp}_${imageToProcess.name}`
        
        const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${uniqueFilename}`)
        const { url, filename } = uploadUrlResponse.data
  
        await axios.put(url, imageToProcess, {
          headers: { 'Content-Type': imageToProcess.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          },
        })
  
        const previewResponse = await axios.get(`https://media.coryfi.com/api/image/${filename}`)
        
        // Update state only after successful upload
        setImages(prev => [...prev, { 
          url: previewResponse.data.url, 
          filename 
        }])
  
        showNotification('Image uploaded successfully')
      } catch (error) {
        console.error('Error uploading image:', error)
        showNotification(`Failed to upload image: ${error.message}`, 'error')
      }
    }
    
    setIsUploading(false)
    setUploadProgress(0)
    
    // Clear the file input
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!session?.user) {
      showNotification('You must be logged in to create a post', 'error')
      return
    }

    if (!content.trim() && images.length === 0) {
      showNotification('Please add some content or images to your post', 'error')
      return
    }

    setIsPosting(true)
    try {
      await uploadPost(userId, session.user.name, content, images.map(img => img.url))
      setContent("")
      setImages([])
      showNotification('Post created successfully')
    } catch (error) {
      console.error('Error creating post:', error)
      showNotification('Failed to create post', 'error')
    } finally {
      setIsPosting(false)
      router.push('/feed')
    }
  }

  return (
    <Card className="bg-white dark:bg-black dark:border border dark:text-white shadow-lg">
      <CardContent className="p-4">
        {notification && (
          <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertTitle>{notification.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={session?.user?.image || ""} alt="Profile" />
            <AvatarFallback>
              {session?.user?.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-grow space-y-4 dark:bg-black dark:text-white">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="What's on your mind?"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ['bold', 'italic', 'underline'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean'],
                ],
              }}
              className="bg-white dark:bg-gray-900 dark:text-white rounded-md"
            />

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={image.filename} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*,image/heic"
                multiple
              />
              <Button 
                onClick={handlePost} 
                disabled={isPosting || isUploading}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ImageIcon } from 'lucide-react'
import dynamic from "next/dynamic"
import axios from "axios"
import { useSession } from "next-auth/react"
import { fetchUserId, uploadPost } from "@/app/api/actions/media"
import UploadProgressBar from "./UploadProgressBar"
import DOMPurify from "dompurify"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

const DRAFT_STORAGE_KEY = "postDraft"

interface NewPostContent {
  text: string
  images: { url: string; filename: string }[]
}

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li"],
  })
}

export default function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newPostContent, setNewPostContent] = useState<NewPostContent>({ text: "", images: [] })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userId, setUserId] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft)
      setNewPostContent({
        text: parsedDraft.text || "",
        images: parsedDraft.images || [],
      })
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      const fetchCred = async () => {
        try {
          const data = await fetchUserId(session.user.email)
          setUserId(data.id)
        } catch (error) {
          console.log("Error while fetching user ID:", error)
        }
      }
      fetchCred()
    }
  }, [session])

  useEffect(() => {
    if (newPostContent.text || newPostContent.images.length > 0) {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          ...newPostContent,
          text: sanitizeInput(newPostContent.text),
        })
      )
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }, [newPostContent])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${file.name}`)
        const { url, filename } = uploadUrlResponse.data

        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          },
        })

        const previewResponse = await axios.get(`https://media.coryfi.com/api/image/${filename}`)
        setNewPostContent((prev) => ({
          ...prev,
          images: [...prev.images, { url: previewResponse.data.url, filename }],
        }))
      }

      showNotification("Images uploaded successfully")
    } catch (error) {
      console.error("Error uploading images:", error)
      showNotification("Failed to upload images", "error")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleNewPost = async () => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      try {
        if (!userId) throw new Error("User ID not found")
        const content = sanitizeInput(newPostContent.text)
        const imageUrl = newPostContent.images.map((img) => img.url)

        const newPost = await uploadPost(userId, session?.user?.name, content, imageUrl)

        setNewPostContent({ text: "", images: [] })
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        showNotification("Post created successfully")
        onClose()
        window.location.reload()
      } catch (error) {
        console.error("Error creating post:", error)
        showNotification("Failed to create post", "error")
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setNewPostContent((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleCancel = () => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newPostContent))
      showNotification("Draft saved")
    }
    onClose()
  }

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    // Implement your notification logic here
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  }

  const formats = ["header", "bold", "italic", "underline", "list", "bullet"]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:bg-opacity-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white w-full h-full md:rounded-lg md:p-6 md:w-full md:max-w-md md:h-auto flex flex-col"
          >
            <div className="flex justify-center items-center p-4 border-b">
              <h2 className="text-xl font-bold">Create Post</h2>
            </div>

            <div className="flex-grow overflow-y-auto">
              {/* Quill Editor Container */}
              <div className="p-4 pb-12 border-b">
                <div className="h-[200px]">
                  <ReactQuill
                    theme="snow"
                    value={newPostContent.text}
                    onChange={(content) => setNewPostContent((prev) => ({ ...prev, text: content }))}
                    placeholder="What's on your mind?"
                    modules={modules}
                    formats={formats}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                    <span className="text-gray-700">Add Photos</span>
                  </Label>
                  <span className="text-sm text-gray-500">{newPostContent.images.length} / 10</span>
                </div>

                {/* Image Preview Grid */}
                {newPostContent.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {newPostContent.images.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Uploaded ${index}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Uploading images...</p>
                    <UploadProgressBar progress={uploadProgress} />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t space-y-2">
              <button
                onClick={handleNewPost}
                className="w-full bg-black text-white py-2.5 rounded-md hover:bg-slate-500 transition-colors"
              >
                Post
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-gray-100 text-gray-800 py-2.5 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

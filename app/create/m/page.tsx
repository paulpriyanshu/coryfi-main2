"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ImageIcon, ArrowLeft, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { fetchUserId, uploadPost } from "@/app/api/actions/media"
import UploadProgressBar from "@/components/ui/UploadProgressBar"
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

export default function CreatePostModal() {
  const [newPostContent, setNewPostContent] = useState<NewPostContent>({ text: "", images: [] })
  const [isUploading, setIsUploading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userId, setUserId] = useState(null)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()

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
        }),
      )
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }, [newPostContent])

  const handleImageUpload = async (files: FileList) => {
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files) {
      handleImageUpload(files)
    }
  }

  const handleNewPost = async () => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      setIsPosting(true)
      try {
        if (!userId) throw new Error("User ID not found")

        const content = sanitizeInput(newPostContent.text)
        const imageUrl = newPostContent.images.map((img) => img.url)
        const newPost = await uploadPost(userId, session?.user?.name, content, imageUrl)

        setNewPostContent({ text: "", images: [] })
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        showNotification("Post created successfully")

        setTimeout(() => {
          router.back()
        }, 1500)
      } catch (error) {
        console.error("Error creating post:", error)
        showNotification("Failed to create post", "error")
      } finally {
        setIsPosting(false)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setNewPostContent((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleGoBack = () => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newPostContent))
      showNotification("Draft saved")
    }
    router.back()
  }

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
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

  const canPost = newPostContent.text.trim() || newPostContent.images.length > 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 w-full h-full md:rounded-xl md:p-0 md:w-full md:max-w-lg md:h-auto flex flex-col shadow-2xl border dark:border-gray-700 md:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 md:rounded-t-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mx-4 mt-4 p-3 rounded-lg text-sm font-medium ${
                  notification.type === "success"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-grow overflow-y-auto">
            {/* Quill Editor Container */}
            <div className="p-4 pb-6 border-b dark:border-gray-700">
              <div className="h-[200px] rounded-lg overflow-hidden border dark:border-gray-600">
                <ReactQuill
                  theme="snow"
                  value={newPostContent.text}
                  onChange={(content) => setNewPostContent((prev) => ({ ...prev, text: content }))}
                  placeholder="What's on your mind?"
                  modules={modules}
                  formats={formats}
                  className="h-full [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-white [&_.ql-toolbar]:dark:border-gray-600 [&_.ql-container]:dark:border-gray-600 [&_.ql-toolbar]:dark:bg-gray-800 [&_.ql-container]:dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-medium">
                      Add Photos
                    </span>
                  </motion.div>
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">{newPostContent.images.length} / 10</span>
              </div>

              {/* Drag and Drop Area */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  isDragging
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop images here, or click "Add Photos" above
                </p>
              </motion.div>

              {/* Image Preview Grid */}
              <AnimatePresence>
                {newPostContent.images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 gap-3 mt-4"
                  >
                    {newPostContent.images.map((img, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square group"
                      >
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Uploaded ${index}`}
                          className="w-full h-full object-cover rounded-lg border dark:border-gray-600"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Uploading images...</p>
                    </div>
                    <UploadProgressBar progress={uploadProgress} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t dark:border-gray-700 space-y-3 bg-white dark:bg-gray-900 md:rounded-b-xl">
            <motion.button
              whileHover={{ scale: canPost ? 1.02 : 1 }}
              whileTap={{ scale: canPost ? 0.98 : 1 }}
              onClick={handleNewPost}
              disabled={!canPost || isPosting || isUploading}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                canPost && !isPosting && !isUploading
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post</span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoBack}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

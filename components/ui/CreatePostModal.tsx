"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ImageUploader from './ImageUploader'
import ImageEditor from './ImageEditor'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { fetchUserId, uploadPost } from '@/app/api/actions/media'
import UploadProgressBar from './UploadProgressBar'

const DRAFT_STORAGE_KEY = 'postDraft'

interface NewPostContent {
    text: string
    images: { url: string; filename: string }[]
}

export default function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [newPostContent, setNewPostContent] = useState<NewPostContent>({ text: '', images: [] })
    const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [userId, setUserId] = useState(null)
    const { data: session } = useSession()

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (savedDraft) {
            setNewPostContent(JSON.parse(savedDraft))
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
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newPostContent))
        } else {
            localStorage.removeItem(DRAFT_STORAGE_KEY)
        }
    }, [newPostContent])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCurrentEditingImage(event.target.result as string)
                    setIsEditModalOpen(true)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveEditedImage = async (editedImage: string) => {
        setIsEditModalOpen(false) // Close the edit modal
        setIsUploading(true)
        setUploadProgress(0)

        try {
            const response = await fetch(editedImage)
            const blob = await response.blob()
            const file = new File([blob], 'edited_image.jpg', { type: 'image/jpeg' })

            const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${file.name}`)
            const { url, filename } = uploadUrlResponse.data

            await axios.put(url, file, {
                headers: { 'Content-Type': file.type },
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

            showNotification('Image uploaded successfully')
        } catch (error) {
            console.error('Error uploading edited image:', error)
            showNotification('Failed to upload edited image', 'error')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleNewPost = async () => {
        if (newPostContent.text.trim() || newPostContent.images.length > 0) {
            try {
                if (!userId) throw new Error('User ID not found')
                let content = newPostContent.text
                let imageUrl = newPostContent.images.map(img => img.url)

                const newPost = await uploadPost({ userId, content, imageUrl })

                setNewPostContent({ text: '', images: [] })
                localStorage.removeItem(DRAFT_STORAGE_KEY)
                showNotification('Post created successfully')
                onClose()
                window.location.reload();
            } catch (error) {
                console.error('Error creating post:', error)
                showNotification('Failed to create post', 'error')
            }
        }
    }

    const handleRemoveImage = (index: number) => {
        setNewPostContent(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        // Implement your notification logic here
        console.log(`${type.toUpperCase()}: ${message}`)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create Post</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <textarea
                            value={newPostContent.text}
                            onChange={(e) => setNewPostContent(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="What's on your mind?"
                            className="w-full h-32 p-2 border rounded-md mb-4 resize-none"
                        />
                        <ImageUploader onUpload={handleImageUpload} />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {newPostContent.images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img src={img.url} alt={`Uploaded ${index}`} className="w-20 h-20 object-cover rounded" />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {isUploading && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Uploading image...</p>
                                <UploadProgressBar progress={uploadProgress} />
                            </div>
                        )}
                        <button
                            onClick={handleNewPost}
                            className="w-full bg-black text-white py-2 rounded-md mt-4 hover:bg-slate-500 transition-colors"
                        >
                            Post
                        </button>
                    </motion.div>
                </motion.div>
            )}
            {currentEditingImage && (
                <ImageEditor
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setCurrentEditingImage(null)
                    }}
                    image={currentEditingImage}
                    onSave={handleSaveEditedImage}
                />
            )}
        </AnimatePresence>
    )
}


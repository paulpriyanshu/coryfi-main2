"use server"


import React, { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, ThumbsUp, Share2, ChevronUp, ImageIcon, AlertCircle, X, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import SearchBar from "@/components/ui/sections/SearchBar"
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'


export const handleShare = async (e, postId) => {
    e.stopPropagation(); // Prevent post modal from opening
    const url = `https://connect.coryfi.com/p/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard', {
        duration: 2000,
        style: {
          background: '#4CAF50',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link', {
        duration: 2000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };
  export const handleSaveEditedImage = async (editedImage) => {
    setIsUploading(true)
    setUploadProgress(0)
  
    try {
      const response = await fetch(editedImage)
      const blob = await response.blob()
      const timestamp = Date.now()
      const originalFileName = imageQueue[0].originalFile.name
      const uniqueFilename = `${timestamp}_${originalFileName}`
      const file = new File([blob], uniqueFilename, { type: 'image/jpeg' })
  
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
      setIsEditModalOpen(false)
      
      // Remove processed image from queue and continue with next
      setImageQueue(prev => prev.slice(1))
      setTimeout(processNextImage, 100) // Small delay before processing next image
    }
  }
  
  
export const handleNewPost = async () => {
      if (newPostContent.text.trim() || newPostContent.images.length > 0) {
        try {
          let content = newPostContent.text
          let imageUrl = newPostContent.images.map(img => img.url)
          
          const newPost = await uploadPost( userId,session.user.name,content, imageUrl )
  
          setPosts(prevPosts => [newPost, ...prevPosts])
          setNewPostContent({ text: '', images: [] })
          localStorage.removeItem(DRAFT_STORAGE_KEY)
          showNotification('Post created successfully')
        } catch (error) {
          console.error('Error creating post:', error)
          showNotification('Failed to create post', 'error')
        }
      }
    }
  
export const handleRemoveImage = (index) => {
      setNewPostContent(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  
export  const handleLike = async (postId) => {
      try {
        if (!session?.user?.email) {
          // showNotification('Please log in to like posts', 'error')
          return
        }
  
        const currentPost = posts.find(post => post.id === postId)
        const isLiked = currentPost?.likes?.includes(session.user.email)
  
        let updatedLikes
        if (isLiked) {
          await dislikePost(postId, session.user.email)
          updatedLikes = currentPost.likes.filter(email => email !== session.user.email)
          showNotification('Post disliked')
        } else {
          await likePost(postId, session.user.email)
          updatedLikes = [...currentPost.likes, session.user.email]
          showNotification(`Post liked `)
        }
  
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, likes: updatedLikes } : post
          )
        )
      } catch (error) {
        console.error('Error toggling like on post:', error)
        showNotification('Failed to update like status', 'error')
      }
    }
'use client'

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
import { fetchImages, fetchUserId, uploadPost } from "../api/actions/media"
import ImageEditModal from '@/components/ui/ImageEditModal'
import { useRouter } from "next/navigation"
import LeftSidebar from "@/components/ui/sections/LeftSideBar"
import { likePost, dislikePost } from "../api/actions/media"
import  PostModal  from "@/components/ui/sections/PostModal"
import { Toaster, toast } from 'react-hot-toast'
import ModernUserCarousel from "@/components/ui/sections/ModernUserCarousel"
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import 'react-quill/dist/quill.snow.css'

const DRAFT_STORAGE_KEY = 'postDraft'

export default function EnhancedInfiniteScrollNetwork() {
  const [posts, setPosts] = useState([])
  const { data: session } = useSession()
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [newPostContent, setNewPostContent] = useState({ text: '', images: [] })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [notification, setNotification] = useState(null)
  const [Email, setEmail] = useState(session?.user?.email)
  const [userId, setUserId] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentEditingImage, setCurrentEditingImage] = useState(null)

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const router = useRouter()
  const [selectedPost, setSelectedPost] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user,setUser]=useState(null)
  const [imageQueue, setImageQueue] = useState([])
const [isProcessingQueue, setIsProcessingQueue] = useState(false)


  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        setNewPostContent(parsedDraft)
      } catch (error) {
        console.error('Error parsing saved draft:', error)
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }
    }
  }, [])

  

  useEffect(() => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newPostContent))
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }, [newPostContent])

  const lastPostElementRef = useCallback((node) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])


       
       
  console.log("email1",session?.user?.email)
  useEffect(() => {
    if (session?.user?.email) {
      const fetchUserDetails = async () => {
        try {
          const data = await fetchUserId(session.user.email);
          setUser(data);
          setUserId(data.id);
        } catch (error) {
          console.error("Error while fetching user ID:", error);
        }
      };
  
      fetchUserDetails();
    }
  }, [session, fetchUserId]);

  
  useEffect(() => {
    const getImages = async () => {
      setIsInitialLoading(true)
      try {
        const images = await fetchImages()
        // console.log("these are images", images)
        setPosts(images)
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    getImages()
  }, [])

  const [isClient, setIsClient] = useState(false) // Track if it's client-side

  useEffect(() => {
    setIsClient(true) // Set to true after the component mounts (client-side)

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    if (isClient) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isClient]) // Ensure effect runs only after component mounts

  const scrollToTop = () => {
    if (isClient) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!isClient) return null // Prevent rendering on the server


  const showNotification = (message, type = 'success') => {
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
    if (newPostContent.images.length + files.length > 5) {
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
        setNewPostContent((prev) => ({
          ...prev,
          images: [...prev.images, { url: previewResponse.data.url, filename }],
        }))
  
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

const handleSaveEditedImage = async (editedImage) => {
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


  const handleNewPost = async () => {
    if (newPostContent.text.trim() || newPostContent.images.length > 0) {
      try {
        let content = newPostContent.text
        let imageUrl = newPostContent.images.map(img => img.url)
        
        const newPost = await uploadPost({ userId, content, imageUrl })

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

  const handleRemoveImage = (index) => {
    setNewPostContent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleLike = async (postId) => {
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

  const handleOpenModal = (post) => {
    // console.log("this is post",post)
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedPost(null)
    setIsModalOpen(false)
  }

  const handleShare = async (e, postId) => {
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



  const RightSidebar = () => (
    <Card className="bg-white shadow-lg sticky top-4">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-black">Profile</h2>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user ? user.userdp : session?.user?.image} alt="Your Profile" />
            <AvatarFallback>YP</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-black cursor-pointer" onClick={()=>router.push('/profile')}>{user ? user?.name : null}</p>
            <Button variant="link" className="text-black p-0 h-auto" onClick={()=>router.push('/settings/profile')}>Edit Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
      <div className="animate-spin rounded-full h-16 w-16 sm:h-10 sm:w-10 border-t-2 border-b-2 border-black"></div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {notification && (
          <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{notification.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="hidden md:block">
            <LeftSidebar  userEmail={session?.user?.email ? session?.user?.email : null} />
          </div>
         

          <div className="md:col-span-2 space-y-4">
            <SearchBar />
            <Card className="bg-white shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar>
                    <AvatarImage src={user ? user.userdp : session?.user?.image} alt="Your Profile" />
                    <AvatarFallback>
                    {user?.name
                      ? user.name
                          .split(" ") // Split the name by spaces
                          .map((part) => part.charAt(0).toUpperCase()) // Get the first character of each part
                          .join("") // Join the characters
                      : "You"}
                  </AvatarFallback>
                  </Avatar>
                  <ReactQuill
                      theme="snow"
                      value={newPostContent.text}
                      onChange={(content) =>
                        setNewPostContent((prev) => ({ ...prev, text: content }))
                      }
                      placeholder="What's on your mind?"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          ['blockquote', 'code-block'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['clean'],
                        ],
                      }}
                      className="mb-2 w-full"
                    />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-black hover:bg-slate-500">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Photo
                      </label>
                      <input
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/*,image/heic"
                            multiple
                          />
                    </Button>
                 
                  </div>
                  <Button className="bg-black hover:bg-slate-500 text-white" onClick={handleNewPost}>
                    Post
                  </Button>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <progress value={uploadProgress} max="100" className="w-full" />
                    <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress.toFixed(0)}%</p>
                  </div>
                )}
                {newPostContent.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {newPostContent.images.map((image, index) => (
                      <div key={Math.random()} className="relative">
                        <img src={image.url || "/placeholder.svg"} alt={`Uploaded ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posts list */}
            <div>
            {(
        <div className="md:hidden">
          <ModernUserCarousel userEmail={Email ? Email : null} />
        </div>
      )}
  {posts.map((post, index) => (
    <React.Fragment key={post._id || index}>
      <Card 
        className="bg-white shadow-lg cursor-pointer my-5" 
        onClick={() => handleOpenModal(post)}
      >
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage 
                src={post?.user?.userdp} 
                alt={post.user?.name} 
                onClick={() => router.push(`/userProfile/${post?.user?.id}`)} 
              />
              <AvatarFallback onClick={() => router.push(`/userProfile/${post?.user?.id}`)}>
                {post.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div onClick={() => router.push(`/userProfile/${post?.user?.id}`)}>
                <CardTitle className="text-black hover:underline hover:cursor-pointer">
                  {post?.user?.name}
                </CardTitle>
              </div>
              <p className="text-sm text-black">
                {new Date(post?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <div
            className="prose" // Apply the prose class for rich text formatting
               dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {/* Media Carousel */}
          {(post.imageUrl?.length > 0 || post.videoUrl?.length > 0) && (
            <Carousel className="w-full">
              <CarouselContent>
                {/* Images */}
                {post.imageUrl?.map((url, idx) => (
                  <CarouselItem key={`image-${idx}`}>
                    <div className="relative w-full h-[500px]">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Post content ${idx + 1}`}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}

                {/* Videos */}
                {post.videoUrl?.map((url, idx) => (
                  <CarouselItem key={`video-${idx}`}>
                    <div className="relative aspect-video">
                      <video
                        src={url}
                        controls
                        className="rounded-lg w-full h-full object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Only show navigation if there's more than one media item */}
              {(post.imageUrl?.length + (post.videoUrl?.length || 0)) > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={`hover:text-black hover:bg-slate-500 ${
              post.likes.includes(session?.user?.email) ? 'text-black' : 'text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleLike(post.id);
            }}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {post.likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black hover:bg-slate-500"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {post.comments?.length || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black hover:bg-slate-500"
            onClick={(e) => handleShare(e, post.id)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </CardFooter>
      </Card>

      {/* Render the ModernUserCarousel after every 5 posts */}
      {(index + 1) % 3 === 0 && (
        <div className="md:hidden">
          <ModernUserCarousel userEmail={Email ? Email : null} />
        </div>
      )}
    </React.Fragment>
  ))}
</div>

            {loading && <p className="text-center text-black">Loading more posts...</p>}
            {!hasMore && <p className="text-center text-black">No more posts to load</p>}
          </div>

          <div className="hidden md:block">
            <RightSidebar />
          </div>
        </div>
      </div>
      {showScrollTop && (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
    <Button
      className="w-10 h-10 opacity-80 rounded-full p-2 bg-black hover:bg-slate-500 text-white shadow-lg"
      onClick={scrollToTop}
      size="icon"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  </div>
)}

      {isEditModalOpen && currentEditingImage && (
        <ImageEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          imageUrl={currentEditingImage}
          onSave={handleSaveEditedImage}
        />
      )}

      {selectedPost && (

          <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
        userId={userId}
      />
      )}
    </div>
  )
}


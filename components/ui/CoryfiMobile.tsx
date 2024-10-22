import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, PlusSquare, Zap, User, Calendar, MapPin, Clock, Image as ImageIcon, X, Heart, MessageCircle, Share2, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const users = [
  { id: 1, username: 'nature_lover', name: 'Emma Green', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, username: 'tech_guru', name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, username: 'foodie_adventures', name: 'Sophie Lee', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, username: 'fitness_freak', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, username: 'bookworm', name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/150?img=5' },
]

const initialPosts = [
  { id: 1, userId: 1, content: 'Just witnessed the most beautiful sunset!', image: 'https://source.unsplash.com/random/800x600?sunset', likes: 120, comments: [] },
  { id: 2, userId: 2, content: 'Excited about the new AI developments!', likes: 89, comments: [] },
  { id: 3, userId: 3, content: 'Tried this amazing new restaurant downtown', image: 'https://source.unsplash.com/random/800x600?food', likes: 56, comments: [] },
  { id: 4, userId: 4, content: 'New personal best at the gym today! 💪', likes: 78, comments: [] },
  { id: 5, userId: 5, content: 'Just finished reading an incredible novel. Highly recommend!', likes: 45, comments: [] },
  { id: 6, userId: 1, content: 'Planning my next big adventure. Any suggestions?', image: 'https://source.unsplash.com/random/800x600?travel', likes: 102, comments: [] },
]

export default function CoryfiMobile() {
  const [activePage, setActivePage] = useState('home')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [posts, setPosts] = useState(initialPosts)
  const [thoughts, setThoughts] = useState([])
  // const [users, setUsers] = useState(sampleUsers)
  const [searchQuery, setSearchQuery] = useState('')

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage posts={posts} thoughts={thoughts} users={users} onLike={handleLike} onComment={handleComment} />
      case 'search':
        return <SearchPage users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      case 'flash':
        return <FlashPage />
      case 'profile':
        return <ProfilePage posts={posts} thoughts={thoughts} users={users} />
      default:
        return <HomePage posts={posts} thoughts={thoughts} users={users} onLike={handleLike} onComment={handleComment} />
    }
  }

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts])
    setIsCreateModalOpen(false)
  }

  const handleCreateThought = (newThought) => {
    setThoughts([newThought, ...thoughts])
    setIsCreateModalOpen(false)
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
    ))
  }

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center p-4 bg-white shadow-md"
      >
        {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Coryfi</h1> */}
        <img src="logo.png" className='w-20 ' />
      </motion.header>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center p-4 bg-white shadow-top"
      >
        <NavButton icon={<Home />} label="Home" isActive={activePage === 'home'} onClick={() => setActivePage('home')} />
        <NavButton icon={<Search />} label="Search" isActive={activePage === 'search'} onClick={() => setActivePage('search')} />
        <CreateButton onClick={() => setIsCreateModalOpen(true)} />
        <NavButton icon={<Zap />} label="Flash" isActive={activePage === 'flash'} onClick={() => setActivePage('flash')} />
        <NavButton icon={<User />} label="Profile" isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
      </motion.nav>

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
        onCreateThought={handleCreateThought}
        users={users}
      />
    </div>
  )
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "relative w-12 h-12 rounded-full transition-colors",
        isActive && "text-blue-600"
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ x: '-50%' }}
        />
      )}
    </Button>
  )
}

function CreateButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full p-3 shadow-lg"
    >
      <PlusSquare className="h-6 w-6" />
      <span className="sr-only">Create</span>
    </motion.button>
  )
}

function CreateModal({ isOpen, onClose, onCreatePost, onCreateThought, users }) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (type) => {
    const newContent = {
      id: Date.now(),
      userId: users[0].id, // Assuming the first user is the current user
      content,
      image,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
    }
    if (type === 'post') {
      onCreatePost(newContent)
    } else {
      onCreateThought(newContent)
    }
    setContent('')
    setImage(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-blue-50">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Create New Content</DialogTitle>
          <DialogDescription className="text-blue-600">Choose to create a post or share a thought.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="col-span-3 min-h-[100px] bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
          {image && (
            <div className="relative">
              <img src={image} alt="Uploaded" className="w-full h-40 object-cover rounded-md" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => document.getElementById('image-upload').click()} className="w-full sm:w-auto bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
              <ImageIcon className="mr-2 h-4 w-4" /> Add Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => handleSubmit('thought')} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white">Share Thought</Button>
              <Button onClick={() => handleSubmit('post')} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white">Create Post</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HomePage({ posts, thoughts, users, onLike, onComment }) {
  const allContent = [...posts, ...thoughts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="p-4 space-y-4">
      {allContent.map((item) => (
        <PostCard key={item.id} item={item} users={users} onLike={onLike} onComment={onComment} />
      ))}
    </div>
  )
}

function PostCard({ item, users, onLike, onComment }) {
  const [commentText, setCommentText] = useState('')
  const user = users.find(u => u.id === item.userId)

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(item.id, { text: commentText, userId: users[0].id, timestamp: new Date().toISOString() })
      setCommentText('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-blue-800">{user.username}</span>
          </div>
          {item.image && (
            <img src={item.image} alt="Post" className="w-full h-48 object-cover rounded-lg mb-2" />
          )}
          <p className="text-sm text-blue-900">{item.content}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start text-sm text-blue-600">
          <div className="flex items-center space-x-2 w-full mb-2">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => onLike(item.id)}>
              <Heart className="h-4 w-4 mr-1" />
              {item.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <MessageCircle className="h-4 w-4 mr-1" />
              {item.comments.length}
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-auto">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full space-y-2">
            {item.comments.map((comment, index) => (
              <div key={index} className="flex items-start  space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={users.find(u => u.id === comment.userId).avatar} />
                  <AvatarFallback>{users.find(u => u.id === comment.userId).username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{users.find(u => u.id === comment.userId).username}</p>
                  <p className="text-xs">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center w-full mt-2">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 mr-2 text-xs h-8"
            />
            <Button type="submit" size="sm" className="h-8 px-2 py-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function SearchPage({ users, searchQuery, setSearchQuery }) {
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <Input
        type="search"
        placeholder="Search Coryfi"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white border-blue-100">
              <CardContent className="p-4 flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-800">{user.name}</h3>
                  <p className="text-sm text-blue-600">@{user.username}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FlashPage() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-blue-800">Flash Events</h2>
      {[1, 2, 3].map((event) => (
        <motion.div
          key={event}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: event * 0.1 }}
        >
          <Card className="bg-white border-blue-100">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full p-3">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Flash Event {event}</h3>
                <p className="text-sm text-blue-600">Quick event description...</p>
                <div className="flex items-center space-x-2 mt-1 text-xs text-blue-500">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>Time</span>
                  <MapPin className="h-4 w-4 ml-2" />
                  <span>Location</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function ProfilePage({ posts, thoughts, users }) {
  const currentUser = users[0] // Assuming the first user is the current user

  return (
    <div className="p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-4"
      >
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-blue-800">{currentUser.name}</h2>
          <p className="text-sm text-blue-600">@{currentUser.username}</p>
        </div>
      </motion.div>
      <Tabs defaultValue="posts" className="bg-white rounded-lg p-2">
        <TabsList className="grid w-full grid-cols-3 bg-blue-100">
          <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-blue-800">Posts</TabsTrigger>
          <TabsTrigger value="thoughts" className="data-[state=active]:bg-white data-[state=active]:text-blue-800">Thoughts</TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:text-blue-800">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="grid grid-cols-3 gap-1">
            {posts.filter(post => post.userId === currentUser.id).map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg overflow-hidden"
              >
                {post.image && <img src={post.image} alt="Post" className="w-full h-full object-cover" />}
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="thoughts">
          <div className="space-y-2">
            {thoughts.filter(thought => thought.userId === currentUser.id).map((thought) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white border-blue-100">
                  <CardContent className="p-2 text-sm text-blue-800">{thought.content}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved">
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((saved) => (
              <motion.div
                key={saved}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg"
              ></motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
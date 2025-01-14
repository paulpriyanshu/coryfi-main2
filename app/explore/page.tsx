'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, Info, ChevronRight, X, ThumbsUp, MessageCircle, Share2, ChevronLeft } from 'lucide-react'
import { Input } from "@/components/ui/Input"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  category: string
  rating: string
  releaseYear: number
  description: string
  likes: number
  comments: number
}

const videos: Video[] = [
  { id: '1', title: 'Stranger Things', thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RyYW5nZXIlMjB0aGluZ3N8ZW58MHx8MHx8fDA%3D', duration: '2:15:30', category: 'trending', rating: '16+', releaseYear: 2016, description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.', likes: 250000, comments: 15000 },
  { id: '2', title: 'Inception', thumbnail: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW5jZXB0aW9ufGVufDB8fDB8fHww', duration: '2:28:00', category: 'sci-fi', rating: '12+', releaseYear: 2010, description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', likes: 180000, comments: 12000 },
  { id: '3', title: 'The Crown', thumbnail: 'https://images.unsplash.com/photo-1590601545055-448a87c2ecae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y3Jvd258ZW58MHx8MHx8fDA%3D', duration: '1:58:00', category: 'drama', rating: '15+', releaseYear: 2016, description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.', likes: 120000, comments: 8000 },
  { id: '4', title: 'Interstellar', thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2V8ZW58MHx8MHx8fDA%3D', duration: '2:49:00', category: 'sci-fi', rating: '12+', releaseYear: 2014, description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', likes: 200000, comments: 14000 },
  { id: '5', title: 'Bridgerton', thumbnail: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVnZW5jeXxlbnwwfHwwfHx8MA%3D%3D', duration: '1:57:00', category: 'drama', rating: '15+', releaseYear: 2020, description: 'Wealth, lust, and betrayal set against the backdrop of Regency-era England, seen through the eyes of the powerful Bridgerton family.', likes: 150000, comments: 10000 },
  { id: '6', title: 'Black Mirror', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaG5vbG9neSUyMGRhcmt8ZW58MHx8MHx8fDA%3D', duration: '1:00:00', category: 'sci-fi', rating: '18+', releaseYear: 2011, description: 'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations and darkest instincts collide.', likes: 180000, comments: 13000 },
  { id: '7', title: 'The Witcher', thumbnail: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFudGFzeSUyMHdvcmxkfGVufDB8fDB8fHww', duration: '1:00:00', category: 'fantasy', rating: '18+', releaseYear: 2019, description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.', likes: 220000, comments: 16000 },
  { id: '8', title: 'Money Heist', thumbnail: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uZXklMjBoZWlzdHxlbnwwfHwwfHx8MA%3D%3D', duration: '1:10:00', category: 'crime', rating: '16+', releaseYear: 2017, description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.', likes: 240000, comments: 18000 },
  { id: '9', title: 'The Queen\'s Gambit', thumbnail: 'https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlc3N8ZW58MHx8MHx8fDA%3D', duration: '1:05:00', category: 'drama', rating: '16+', releaseYear: 2020, description: 'Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.', likes: 190000, comments: 14000 },
]

const shortVideos: Video[] = [
  { id: 's1', title: 'Quick Laugh', thumbnail: 'https://images.unsplash.com/photo-1543584756-8f40a802e14f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29tZWR5fGVufDB8fDB8fHww', duration: '0:15', category: 'comedy', rating: 'PG', releaseYear: 2023, description: 'A hilarious 15-second clip that will brighten your day.', likes: 50000, comments: 2000 },
  { id: 's2', title: 'Dance Challenge', thumbnail: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGFuY2V8ZW58MHx8MHx8fDA%3D', duration: '0:30', category: 'music', rating: 'PG', releaseYear: 2023, description: 'Join the latest dance craze sweeping the internet!', likes: 75000, comments: 3500 },
  { id: 's3', title: 'Life Hack', thumbnail: 'https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGlmZSUyMGhhY2t8ZW58MHx8MHx8fDA%3D', duration: '0:45', category: 'lifestyle', rating: 'G', releaseYear: 2023, description: 'Learn a quick and easy life hack to save time and energy.', likes: 60000, comments: 2500 },
  { id: 's4', title: 'Cute Pets', thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nfGVufDB8fDB8fHww', duration: '0:20', category: 'animals', rating: 'G', releaseYear: 2023, description: 'Adorable pets doing the cutest things. Prepare for cuteness overload!', likes: 90000, comments: 4000 },
  { id: 's5', title: 'Sports Highlight', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BvcnRzfGVufDB8fDB8fHww', duration: '0:25', category: 'sports', rating: 'G', releaseYear: 2023, description: 'Catch the most exciting moments from recent sports events.', likes: 70000, comments: 3000 },
  { id: 's6', title: 'Cooking Tip', thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29va2luZ3xlbnwwfHwwfHx8MA%3D%3D', duration: '0:40', category: 'food', rating: 'G', releaseYear: 2023, description: 'Master this simple cooking technique to elevate your dishes.', likes: 55000, comments: 2200 },
  { id: 's7', title: 'Travel Moment', thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhdmVsfGVufDB8fDB8fHww', duration: '0:35', category: 'travel', rating: 'G', releaseYear: 2023, description: 'Experience a breathtaking view from an exotic location.', likes: 65000, comments: 2800 },
  { id: 's8', title: 'Fashion Trend', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D', duration: '0:50', category: 'fashion', rating: 'PG', releaseYear: 2023, description: 'Discover the hottest fashion trend of the season.', likes: 80000, comments: 3800 },
]

const categories = ['All', 'Trending', 'New Releases', 'TV Shows', 'Movies', 'My List']
const userFavorites = ['Sci-Fi', 'Drama', 'Comedy', 'Action', 'Romance']

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredVideos, setFilteredVideos] = useState(videos)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isFlashVideo, setIsFlashVideo] = useState(false)
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const filtered = videos.filter(video => 
      (selectedCategory === 'All' || 
       video.category.toLowerCase() === selectedCategory.toLowerCase()) &&
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVideos(filtered)
  }, [selectedCategory, searchTerm])

  const handleVideoClick = (video: Video, isFlash: boolean) => {
    setSelectedVideo(video)
    setIsFlashVideo(isFlash)
    if (isFlash) {
      setCurrentFlashIndex(shortVideos.findIndex(v => v.id === video.id))
    }
  }

  const handleFlashNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentFlashIndex((prevIndex) => (prevIndex + 1) % shortVideos.length)
    } else {
      setCurrentFlashIndex((prevIndex) => (prevIndex - 1 + shortVideos.length) % shortVideos.length)
    }
    setSelectedVideo(shortVideos[currentFlashIndex])
  }

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/path-to-your-background.jpg')" }}>
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-end items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <Input
              type="search"
              placeholder="Search titles"
              className="pl-10 bg-white border-black text-black placeholder-black focus:ring-black focus:border-black w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
            onClick={() => handleCategoryScroll('left')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div
            ref={categoriesRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...categories, ...userFavorites].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-black text-white shadow-lg shadow-black/50 scale-105'
                    : 'bg-black text-black hover:bg-slate-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
            onClick={() => handleCategoryScroll('right')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleVideoClick(video, false)}
            >
              <AspectRatio ratio={16 / 9}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2 text-white">{video.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-black text-white">
                    {video.rating}
                  </Badge>
                  <span className="text-sm text-black">{video.releaseYear}</span>
                  <span className="text-sm text-black">{video.duration}</span>
                </div>
                <p className="text-sm text-black line-clamp-2">{video.description}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <Button variant="default" className="bg-black hover:bg-slate-500 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button variant="secondary" className="bg-black text-black hover:bg-slate-500">
                    <Info className="w-4 h-4 mr-2" />
                    More Info
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-black">Flash</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {shortVideos.map((video) => (
              <motion.div
                key={video.id}
                className="relative cursor-pointer overflow-hidden rounded-lg w-32 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleVideoClick(video, true)}
              >
                <AspectRatio ratio={9 / 16}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-sm font-bold mb-1 truncate text-white">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black">{video.duration}</span>
                    <Badge variant="secondary" className="text-xs bg-black text-white">
                      {video.category}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Continue Watching</h2>
            <Button variant="ghost" className="text-black hover:text-black">
              See All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videos.slice(0, 5).map((video) => (
              <motion.div
                key={video.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleVideoClick(video, false)}
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold truncate text-white">{video.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="bg-black text-white">
                        {video.rating}
                      </Badge>
                      <span className="text-sm text-black">{video.duration}</span>
                    </div>
                  </div>
                </AspectRatio>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black">
                  <div className="h-full bg-black" style={{ width: '30%' }}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-[900px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black">{selectedVideo?.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full text-black"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className={`grid ${isFlashVideo ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            <div className={isFlashVideo ? 'relative h-[80vh]' : ''}>
              <AspectRatio ratio={isFlashVideo ? 9 / 16 : 16 / 9}>
                <img
                  src={selectedVideo?.thumbnail}
                  alt={selectedVideo?.title}
                  className="object-cover w-full h-full rounded-lg"
                />
              </AspectRatio>
              {isFlashVideo && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white"
                    onClick={() => handleFlashNavigation('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
                    onClick={() => handleFlashNavigation('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
            <div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="default" className="bg-black hover:bg-slate-500 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <div className="flex items-center space-x-2 text-black">
                    <ThumbsUp className="w-5 h-5" />
                    <span>{selectedVideo?.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-black">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedVideo?.comments.toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="ghost" className="text-black">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <DialogDescription className="mt-4 text-black">
                {selectedVideo?.description}
              </DialogDescription>
              {!isFlashVideo && (
                <>
                  <h4 className="text-lg font-semibold mb-4 mt-6 text-black">Suggested Videos</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin' }}>
                    {videos.filter(v => v.id !== selectedVideo?.id).slice(0, 5).map((video) => (
                      <div
                        key={video.id}
                        className="flex items-start space-x-4 p-2 hover:bg-slate-500 rounded-lg cursor-pointer"
                        onClick={() => handleVideoClick(video, false)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div>
                          <h5 className="font-semibold text-black">{video.title}</h5>
                          <p className="text-sm text-black">{video.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center  h-full w-full">
    <h1
    className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-800 to-slate-600 text-transparent bg-clip-text transition duration-500 ease-in-out transform hover:scale-110 
    absolute top-24 sm:top-4/5 sm:transform sm:-translate-y-5/4"
  >
  Coming Soon
</h1>
      </div>
    </div>
  )
}
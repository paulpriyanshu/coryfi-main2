"use client"

import React, { useState, useCallback } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { globeConfig, sampleArcs } from '../api/actions/globestats'
import { Progress } from '@/components/ui/progress'

const World = dynamic(() => import("../../components/ui/globe").then((m) => m.World), {
  ssr: false,
  loading: () => <p className='flex justify-center items-center h-full text-2xl font-bold'><Progress value={50}/></p>
})

interface Account {
  name: string
  username: string
}

interface Community {
  name: string
  members: number
}

interface Post {
  user: string
  time: string
  content: string
}

const initialAccounts: Account[] = [
  { name: 'Account One', username: '@username1' },
  { name: 'Account Two', username: '@username2' },
  { name: 'Account Three', username: '@username3' },
  { name: 'Account Four', username: '@username4' },
  { name: 'Account Five', username: '@username5' },
  { name: 'Account Six', username: '@username6' },
]

const initialCommunities: Community[] = [
  { name: 'Community Alpha', members: 250 },
  { name: 'Community Beta', members: 450 },
  { name: 'Community Gamma', members: 300 },
  { name: 'Community Delta', members: 580 },
  { name: 'Community Epsilon', members: 120 },
  { name: 'Community Zeta', members: 780 },
]

const initialPosts: Post[] = [
  {
    user: 'User One',
    time: '3h ago',
    content: 'This is a sample post content for post 1. It can contain text, images, or other media.',
  },
  {
    user: 'User Two',
    time: '1h ago',
    content: 'This is a sample post content for post 2. It can contain text, images, or other media.',
  },
  {
    user: 'User Three',
    time: '30m ago',
    content: 'This is a sample post content for post 3. It can contain text, images, or other media.',
  },
]

export default function Page() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [communities] = useState<Community[]>(initialCommunities)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGlobe, setShowGlobe] = useState(false)
  const [globeKey, setGlobeKey] = useState(0)

  const handleGroupClick = useCallback(() => {
    setIsExpanded(true)
    setShowGlobe(false)
    setTimeout(() => {
      setShowGlobe(true)
      setGlobeKey(prevKey => prevKey + 1)
    }, 300)
    setTimeout(() => setAccounts([]), 300)
  }, [])

  const handleRevert = useCallback(() => {
    setIsExpanded(false)
    setShowGlobe(false)
    setAccounts(initialAccounts)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <style jsx global>{`
        .column {
          transition: width 0.3s ease-in-out, flex-grow 0.3s ease-in-out;
        }
        .content {
          transition: opacity 0.3s ease-in-out;
        }
        .expanded {
          width: 50%;
          flex-grow: 1;
        }
        .shrunk {
          width: 25%;
          flex-grow: 0;
        }
      `}</style>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative flex justify-center ">
            <input
              type="text"
              placeholder="Search"
              className="w-2/3 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-8">
          <div 
            className={`column bg-white rounded-xl shadow p-6 ${
              isExpanded ? 'expanded' : 'w-1/3'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{isExpanded ? '' : 'Accounts'}</h2>
              {isExpanded && (
                <button
                  onClick={handleRevert}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none transition-colors duration-200"
                  aria-label="Revert section size"
                >
                  <ArrowLeftRight className="h-6 w-6" />
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              {!showGlobe ? (
                <motion.div
                  key="accounts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {accounts.map((account, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-gray-500">{account.username}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="globe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center bg-white animate-bg-transition"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-4"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2">
                      People across the world interacting
                    </h2>
                  </motion.div>
                  <div className="w-full h-[400px] relative">
                    <World key={globeKey} data={sampleArcs} globeConfig={globeConfig} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={`column bg-white rounded-xl shadow p-6 ${isExpanded ? 'shrunk' : 'w-1/3'}`}>
            <h2 className="text-xl font-semibold mb-4">Communities/Grps</h2>
            <div className="content">
              {communities.map((community, index) => (
                <div 
                  key={index} 
                  className="mb-4 cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2 rounded"
                  onClick={handleGroupClick}
                >
                  <h3 className="font-medium">{community.name}</h3>
                  <p className="text-sm text-gray-500">{community.members} members</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`column bg-white rounded-xl shadow p-6 ${isExpanded ? 'shrunk' : 'w-1/3'}`}>
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            <div className="content">
              {initialPosts.map((post, index) => (
                <div key={index} className="mb-6">
                  <div className="flex items-center mb-2">
                    <div className="font-medium">{post.user}</div>
                    <div className="text-sm text-gray-500 ml-2">{post.time}</div>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  ) 
}


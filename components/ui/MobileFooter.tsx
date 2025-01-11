"use client"

import React from 'react'
import { useState } from 'react'
import { Home, Search, PlusSquare, Zap, User, Network } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'

export function MobileFooter() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [activePage, setActivePage] = useState('network')
    const router = useRouter()

    function NavButton({ icon, label, isActive, onClick, href }) {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    onClick()
                    router.push(href)
                }}
                className={cn(
                    "relative w-12 h-12 rounded-full transition-colors flex items-center justify-center",
                    isActive ? "text-blue-600 bg-blue-100" : "text-gray-600"
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
            </motion.button>
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

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
            <nav className="flex justify-around items-center h-16">
                <NavButton
                    icon={<Home />}
                    label="Home"
                    isActive={activePage === 'home'}
                    onClick={() => setActivePage('home')}
                    href="/feed"
                />
                <NavButton
                    icon={<Network />}
                    label="Network"
                    isActive={activePage === 'network'}
                    onClick={() => setActivePage('network')}
                    href="/"
                />
                <CreateButton onClick={() => setIsCreateModalOpen(true)} />
                <NavButton
                    icon={<Zap />}
                    label="Flash"
                    isActive={activePage === 'flash'}
                    onClick={() => setActivePage('flash')}
                    href="/flash"
                />
                <NavButton
                    icon={<User />}
                    label="Profile"
                    isActive={activePage === 'profile'}
                    onClick={() => setActivePage('profile')}
                    href="/profile"
                />
            </nav>
        </footer>
    )
}

export default MobileFooter
"use client"

import React, { useState, useEffect } from 'react'
import { Home, Search, PlusSquare, Zap, User, Network } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import CreatePostModal from './CreatePostModal'
import DraftAlert from './DraftAlert'

export function MobileFooter() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [activePage, setActivePage] = useState('network')
    const [hasDraft, setHasDraft] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const draft = localStorage.getItem('postDraft')
        setHasDraft(!!draft)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY < lastScrollY) {
                setIsVisible(true)
            } else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
                setIsVisible(false)
            }
            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

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

    const handleCloseModal = () => {
        setIsCreateModalOpen(false)
        if (hasDraft) {
            setHasDraft(true)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.footer
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20"
                    >
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
                    </motion.footer>
                )}
            </AnimatePresence>
            <CreatePostModal isOpen={isCreateModalOpen} onClose={handleCloseModal} />
            <DraftAlert isOpen={hasDraft} onClose={() => setHasDraft(false)} />
        </>
    )
}

export default MobileFooter

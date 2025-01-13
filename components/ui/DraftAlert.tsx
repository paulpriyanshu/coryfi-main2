"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function DraftAlert({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50"
                    role="alert"
                >
                    <div className="flex items-center">
                        <AlertTriangle className="flex-shrink-0 mr-2" />
                        <span className="block sm:inline">You have an unsaved draft. Do you want to continue editing?</span>
                        <button
                            onClick={onClose}
                            className="ml-auto bg-transparent text-yellow-700 hover:text-yellow-900"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => {
                                // Implement logic to open the create post modal with the draft content
                                onClose()
                            }}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                            Continue Editing
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


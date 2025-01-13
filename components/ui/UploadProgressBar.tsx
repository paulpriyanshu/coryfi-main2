import React from 'react'
import { motion } from 'framer-motion'

interface UploadProgressBarProps {
    progress: number
}

export default function UploadProgressBar({ progress }: UploadProgressBarProps) {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <motion.div 
                className="bg-blue-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    )
}


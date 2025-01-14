"use client"

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, RotateCw, CropIcon } from 'lucide-react'
import Cropper, { Area } from 'react-easy-crop'

interface ImageEditorProps {
    isOpen: boolean
    onClose: () => void
    image: string
    onSave: (editedImage: string) => void
}

export default function ImageEditor({ isOpen, onClose, image, onSave }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleRotate = (direction: 'left' | 'right') => {
        setRotation(prev => (direction === 'left' ? prev - 90 : prev + 90))
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<string> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return Promise.reject('No 2d context')
        }

        const maxSize = Math.max(image.width, image.height)
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

        canvas.width = safeArea
        canvas.height = safeArea

        ctx.translate(safeArea / 2, safeArea / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-safeArea / 2, -safeArea / 2)

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        )

        const data = ctx.getImageData(0, 0, safeArea, safeArea)

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.putImageData(
            data,
            0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
            0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty')
                    return
                }
                resolve(URL.createObjectURL(blob))
            }, 'image/jpeg')
        })
    }

    const handleSave = async () => {
        if (!croppedAreaPixels) return
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
            onSave(croppedImage)
            onClose() // Close the modal after saving
        } catch (e) {
            console.error(e)
        }
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
                            <h2 className="text-xl font-bold">Edit Image</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="relative h-64 mb-4">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                rotation={rotation}
                            />
                        </div>
                        <div className="flex justify-center space-x-4 mb-4">
                            <button onClick={() => handleRotate('left')} className="p-2 bg-gray-200 rounded-full">
                                <RotateCcw size={24} />
                            </button>
                            <button onClick={() => handleRotate('right')} className="p-2 bg-gray-200 rounded-full">
                                <RotateCw size={24} />
                            </button>
                            <button className="p-2 bg-gray-200 rounded-full">
                                <CropIcon size={24} />
                            </button>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full mb-4"
                        />
                        <button
                            onClick={handleSave}
                            className="w-full bg-black text-white py-2 rounded-md mt-4 hover:bg-slate-500 transition-colors"
                        >
                            Save Edited Image
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
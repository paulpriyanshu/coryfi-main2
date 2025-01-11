import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RotateCw, ZoomIn, ZoomOut, CropIcon } from 'lucide-react'
import { Slider } from "@/components/ui/slider"

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageEditModal({ isOpen, onClose, imageUrl, onSave }) {
  const [crop, setCrop] = useState<Crop>()
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const imageRef = useRef<HTMLImageElement>(null)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerAspectCrop(width, height, 16 / 9)
    setCrop(initialCrop)
  }, [])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleSave = () => {
    if (imageRef.current && completedCrop?.width && completedCrop?.height) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height

      const pixelRatio = window.devicePixelRatio
      canvas.width = completedCrop.width * pixelRatio
      canvas.height = completedCrop.height * pixelRatio

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = 'high'

      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY
      const rotRad = (rotation * Math.PI) / 180

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(rotRad)
      ctx.scale(zoom, zoom)

      ctx.translate(-canvas.width / 2, -canvas.height / 2)
      ctx.drawImage(
        imageRef.current,
        cropX,
        cropY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      ctx.restore()

      const base64Image = canvas.toDataURL('image/jpeg', 0.9)
      onSave(base64Image)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="max-h-[calc(90vh-200px)]"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Edit"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                maxHeight: '70vh',
                transition: 'transform 0.3s ease',
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAspect(1)}
            className={aspect === 1 ? 'bg-primary text-primary-foreground' : ''}
          >
            <CropIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAspect(16/9)}
            className={aspect === 16/9 ? 'bg-primary text-primary-foreground' : ''}
          >
            <div className="w-4 h-3 border-2" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAspect(undefined)}
            className={aspect === undefined ? 'bg-primary text-primary-foreground' : ''}
          >
            <div className="w-4 h-4 border-2" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-[100px]"
            />
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


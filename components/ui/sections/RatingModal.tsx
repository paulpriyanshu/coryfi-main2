import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number) => void
}

export function RatingModal({ isOpen, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleSubmit = () => {
    if (rating !== null) {
      onSubmit(rating)
      onClose()
    }
  }

  const getGradient = (value: number) => {
    if (value <= 3) return 'from-red-400 via-red-500 to-orange-500'
    if (value <= 7) return 'from-yellow-400 via-yellow-500 to-green-400'
    return 'from-green-400 via-green-500 to-teal-500'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            How well do you know this person?
          </DialogTitle>
        </DialogHeader>
        <div className="py-8">
          <div className="grid grid-cols-10 gap-2 px-4 max-w-[460px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm
                  transition-all duration-300 ease-in-out transform hover:scale-110
                  ${(rating === value || hoveredRating === value) ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : ''}
                  ${`bg-gradient-to-br ${getGradient(value)}`}`}
              >
                {value}
              </button>
            ))}
          </div>
          {/* <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            {hoveredRating && (
              <p className="font-medium animate-fade-in">
                {hoveredRating <= 3 ? "Not very well" : 
                 hoveredRating <= 7 ? "Somewhat well" : "Very well"}
              </p>
            )}
          </div> */}
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={rating === null}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

    
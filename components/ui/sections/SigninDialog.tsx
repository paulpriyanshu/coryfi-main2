import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SignInDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInDialog({ isOpen, onClose }: SignInDialogProps) {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/signup')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            Please sign in to access this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSignIn}>Sign In</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


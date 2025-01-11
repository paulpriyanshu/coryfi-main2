import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaneIcon as PaperAirplaneIcon, X } from 'lucide-react'

interface ChatDialogProps {
  chat: ChatListItemInterface
  messages: ChatMessageInterface[]
  onClose: () => void
  onSendMessage: (content: string) => void
}

export function ChatDialog({ chat, messages, onClose, onSendMessage }: ChatDialogProps) {
  const [message, setMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{chat.name}</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4" viewportRef={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-2 rounded-lg ${
                  msg.sender._id === 'user2' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                }`}
                style={{ maxWidth: '70%' }}
              >
                <div className="font-bold">{msg.sender.name}</div>
                <div>{msg.content}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon">
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


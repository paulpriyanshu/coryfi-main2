"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSocket } from "@/components/ui/sections/context/SocketContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, SendIcon, Trash2, X } from "lucide-react"
import { getChatMessages, sendMessage, deleteMessage } from "@/components/ui/sections/api"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { messagesent } from "@/app/api/actions/network"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const TYPING_EVENT = "typing"
const STOP_TYPING_EVENT = "stopTyping"
const MESSAGE_RECEIVED_EVENT = "messageReceived"
const JOIN_CHAT_EVENT = "joinChat"
const MESSAGE_DELETE_EVENT = "messageDeleted"

export default function ChatInterface({
  chatId,
  currentUserId,
  //   receiverId,
  initialChat,
  initialMessages,
}) {
  const router = useRouter()

  const [chat, setChat] = useState(initialChat)
  const [messages, setMessages] = useState(initialMessages || [])
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState([])
  const [isLoading, setIsLoading] = useState(!initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { socket } = useSocket()
  const { data: session } = useSession()
  const [sending, setSending] = useState(false)
  console.log("chat id", chatId, "current user", currentUserId)
  // Fetch messages if not provided initially or for refreshing
  const fetchMessages = useCallback(async () => {
    if (!chatId || !currentUserId) return

    try {
      const response = await getChatMessages(chatId, currentUserId)
      console.log("chats", response.data.data)
      const newMessages = response.data.data.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      setMessages((prevMessages) => {
        const lastMessageId = prevMessages[prevMessages.length - 1]?._id
        const newMessageIndex = newMessages.findIndex((msg) => msg._id === lastMessageId)
        if (newMessageIndex === -1) return newMessages
        return [...prevMessages, ...newMessages.slice(newMessageIndex + 1)]
      })
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to fetch messages")
    } finally {
      setIsLoading(false)
    }
  }, [chatId, currentUserId])

  useEffect(() => {
    if (socket && chatId) {
      socket.emit(JOIN_CHAT_EVENT, chatId)

      socket.on(TYPING_EVENT, handleOnSocketTyping)
      socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping)
      socket.on(MESSAGE_RECEIVED_EVENT, handleMessageReceived)
      socket.on(MESSAGE_DELETE_EVENT, handleMessageDelete)

      // Only fetch if we don't have initial messages
      if (!initialMessages || initialMessages.length === 0) {
        fetchMessages()
      } else {
        setIsLoading(false)
      }

      const intervalId = setInterval(fetchMessages, 10000)

      return () => {
        socket.off(TYPING_EVENT)
        socket.off(STOP_TYPING_EVENT)
        socket.off(MESSAGE_RECEIVED_EVENT)
        socket.off(MESSAGE_DELETE_EVENT)
        clearInterval(intervalId)
      }
    }
  }, [socket, chatId, fetchMessages, initialMessages])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleMessageReceived = (message) => {
    if (message.chat === chatId) {
      setMessages((prevMessages) => [...prevMessages, message])

      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
  }

  const handleMessageDelete = ({ chatId: msgChatId, messageId }) => {
    if (msgChatId === chatId) {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId))
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() || attachments.length > 0) {
      setSending(true)
      try {
        if (socket) {
          socket.emit(STOP_TYPING_EVENT, chatId)
        }

        const participant = chat?.participants?.find((p) => p.username !== session?.user?.name)
        const recipientEmail = participant ? participant.email : null

        const response = await sendMessage(chatId, newMessage, attachments, currentUserId)
        await messagesent(session?.user?.name, recipientEmail)

        setNewMessage("")

        if (socket) {
          socket.emit(MESSAGE_RECEIVED_EVENT, {
            ...response.data,
            chat: chatId,
          })
        }

        setMessages((prevMessages) => [...prevMessages, response.data])
        setSending(false)
      } catch (error) {
        console.error("Error sending message:", error)
        toast.error("Failed to send message")
      }
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(chatId, messageId)

      if (socket) {
        socket.emit(MESSAGE_DELETE_EVENT, {
          chatId: chatId,
          messageId,
        })
      }

      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId))
      toast.success("Message deleted successfully")
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Failed to delete message")
    }
  }

  const handleOnSocketTyping = (msgChatId) => {
    if (msgChatId !== chatId) return
    setIsTyping(true)
  }

  const handleOnSocketStopTyping = (msgChatId) => {
    if (msgChatId !== chatId) return
    setIsTyping(false)
  }

  const handleTyping = () => {
    if (!socket) return

    socket.emit(TYPING_EVENT, chatId)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, chatId)
    }, 3000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-2">
          {chat && (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={chat?.participants.filter((p)=>p._id!==currentUserId).map((m)=>m.avatar.url) || "/placeholder.svg"} alt={chat?.name} />
                <AvatarFallback>{chat?.participants.filter((p)=>p._id!==currentUserId).map((m)=>m.username) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{chat?.participants.filter((p)=>p._id!==currentUserId).map((m)=>m.username)} </span>
                {isTyping && <span className="text-xs text-muted-foreground">typing...</span>}
              </div>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages - Scrollable area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-1" ref={scrollAreaRef}>
          <div className="space-y-3 pb-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-24 text-muted-foreground">
                <p className="text-lg">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg?.sender?._id === currentUserId ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`flex flex-col space-y-1 max-w-[85%] ${
                        msg?.sender?._id === currentUserId ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 px-2">
                        {msg?.sender?._id !== currentUserId && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={msg?.sender?.avatar?.url || "/placeholder.svg"}
                              alt={msg?.sender?.username}
                            />
                            <AvatarFallback>{msg?.sender?.username?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {msg?.sender?.username} •{" "}
                          {msg?.createdAt && !isNaN(new Date(msg?.createdAt).getTime())
                            ? format(new Date(msg?.createdAt), "HH:mm")
                            : "N/A"}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl break-words ${
                          msg?.sender?._id === currentUserId
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg?.content}</p>
                      </div>
                      {msg?.sender?._id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(msg?._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 h-6 px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            className="flex-grow rounded-full"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="rounded-full"
            disabled={!newMessage.trim() && attachments.length === 0}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

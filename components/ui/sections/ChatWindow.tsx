'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from "./context/SocketContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, PaperclipIcon, SendIcon, Trash2 } from 'lucide-react'
import { getChatMessages, sendMessage, deleteMessage } from './api'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const TYPING_EVENT = "typing"
const STOP_TYPING_EVENT = "stopTyping"
const MESSAGE_RECEIVED_EVENT = "messageReceived"
const JOIN_CHAT_EVENT = "joinChat"
const MESSAGE_DELETE_EVENT = "messageDeleted"

export function ChatWindow({ chat, currentUserId, onClose, onChatUpdated, refetchMessages, onMessagesFetched }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { socket } = useSocket()

  const fetchMessages = useCallback(async () => {
    try {
      const response = await getChatMessages(chat._id, currentUserId)
      const newMessages = response.data.data.sort((a: { createdAt: string }, b: { createdAt: string }) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setMessages(prevMessages => {
        const lastMessageId = prevMessages[prevMessages.length - 1]?._id
        const newMessageIndex = newMessages.findIndex(msg => msg._id === lastMessageId)
        if (newMessageIndex === -1) return newMessages
        return [
          ...prevMessages,
          ...newMessages.slice(newMessageIndex + 1)
        ]
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error("Failed to fetch messages")
    } finally {
      setIsLoading(false)
      onMessagesFetched()
    }
  }, [chat._id, currentUserId, onMessagesFetched])

  // Effect for socket event handling and initial message fetch
  useEffect(() => {
    if (socket && chat._id) {
      // Join the chat room
      socket.emit(JOIN_CHAT_EVENT, chat._id)
      // console.log("joined chat")

      // Socket event handlers
      socket.on(TYPING_EVENT, handleOnSocketTyping)
      socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping)
      socket.on(MESSAGE_RECEIVED_EVENT, handleMessageReceived)
      socket.on(MESSAGE_DELETE_EVENT, handleMessageDelete)

      // Initial message fetch
      fetchMessages()

      // Set up interval for fetching messages every 5 seconds
      const intervalId = setInterval(fetchMessages, 10000)

      // Cleanup socket listeners and interval
      return () => {
        socket.off(TYPING_EVENT)
        socket.off(STOP_TYPING_EVENT)
        socket.off(MESSAGE_RECEIVED_EVENT)
        socket.off(MESSAGE_DELETE_EVENT)
        clearInterval(intervalId)
      }
    }
  }, [socket, chat._id, fetchMessages])


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Refetch messages effect
  useEffect(() => {
    if (refetchMessages) {
      fetchMessages()
    }
  }, [refetchMessages, fetchMessages])

  const handleMessageReceived = (message) => {
    if (message.chat === chat._id) {
      setMessages(prevMessages => [...prevMessages, message])
      onChatUpdated()
      
      // Auto-scroll to bottom on new message
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
  }

  const handleMessageDelete = ({ chatId, messageId }) => {
    if (chatId === chat._id) {
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== messageId)
      )
      onChatUpdated()
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() || attachments.length > 0) {
      try {
        if (socket) {
          socket.emit(STOP_TYPING_EVENT, chat._id)
        }

        const response = await sendMessage(chat._id, newMessage, attachments, currentUserId)
        setNewMessage('')
        setAttachments([])

        if (socket) {
          socket.emit(MESSAGE_RECEIVED_EVENT, {
            ...response.data,
            chat: chat._id
          })
        }

        setMessages(prevMessages => [...prevMessages, response.data])
        onChatUpdated()
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error("Failed to send message")
      }
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(chat._id, messageId)
      
      if (socket) {
        socket.emit(MESSAGE_DELETE_EVENT, { 
          chatId: chat._id, 
          messageId 
        })
      }

      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== messageId)
      )
      toast.success("Message deleted successfully")
      onChatUpdated()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error("Failed to delete message")
    }
  }

  const handleOnSocketTyping = (chatId) => {
    if (chatId !== chat._id) return
    setIsTyping(true)
  }

  const handleOnSocketStopTyping = (chatId) => {
    if (chatId !== chat._id) return
    setIsTyping(false)
  }

  const handleTyping = () => {
    if (!socket) return

    socket.emit(TYPING_EVENT, chat._id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, chat._id)
    }, 3000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachments(files)
  }
  console.log("chats",chat)
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="px-4 py-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg?.sender?._id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[70%] ${
                      msg?.sender?._id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={msg?.sender?.avatar.url} alt={msg?.sender?.username} />
                        <AvatarFallback>{msg?.sender?.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-xs">{msg?.sender?.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {msg?.createdAt && !isNaN(new Date(msg?.createdAt).getTime())
                          ? format(new Date(msg?.createdAt), 'HH:mm')
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm break-words">{msg?.content}</p>
                    {msg?.attachments && msg?.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg?.attachments.map((attachment) => (
                          <a
                            key={attachment._id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black underline text-xs block"
                          >
                            View Attachment
                          </a>
                        ))}
                      </div>
                    )}
                    {msg?.sender?._id === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(msg?._id)}
                        className="mt-1 p-0 h-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t">
        {isTyping && (
          <div className="text-sm text-muted-foreground mb-2">
            Someone is typing...
          </div>
        )}
        <div className="flex items-center space-x-2 mb-10">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          {/* <label htmlFor="file-upload" className="cursor-pointer">
            <PaperclipIcon className="h-6 w-6" />
          </label> */}
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={handleSendMessage}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}


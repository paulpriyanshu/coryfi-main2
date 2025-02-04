'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from "./context/SocketContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, SendIcon, Trash2, X } from 'lucide-react'
import { getChatMessages, sendMessage, deleteMessage } from './api'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ChatBubbleLeftEllipsisIcon, ChevronDoubleDownIcon } from '@heroicons/react/20/solid'
import { messagesent } from '@/app/api/actions/network'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

const TYPING_EVENT = "typing"
const STOP_TYPING_EVENT = "stopTyping"
const MESSAGE_RECEIVED_EVENT = "messageReceived"
const JOIN_CHAT_EVENT = "joinChat"
const MESSAGE_DELETE_EVENT = "messageDeleted"

export function MobileChatWindow({ chat,currentUserId, onClose, onChatUpdated, refetchMessages, onMessagesFetched }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [attachments,setAttachments]=useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { socket } = useSocket()
  const {data:session,status}=useSession()
  const [sending,setSending]=useState(false)

  const fetchMessages = useCallback(async () => {
    try {
      const response = await getChatMessages(chat._id, currentUserId)
      const newMessages = response.data.data.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
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

  useEffect(() => {
    if (socket && chat._id) {
      socket.emit(JOIN_CHAT_EVENT, chat._id)
      // console.log("joined chat")

      socket.on(TYPING_EVENT, handleOnSocketTyping)
      socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping)
      socket.on(MESSAGE_RECEIVED_EVENT, handleMessageReceived)
      socket.on(MESSAGE_DELETE_EVENT, handleMessageDelete)

      fetchMessages()

      const intervalId = setInterval(fetchMessages, 10000)

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

  useEffect(() => {
    if (refetchMessages) {
      fetchMessages()
    }
  }, [refetchMessages, fetchMessages])

  const handleMessageReceived = (message) => {
    if (message.chat === chat._id) {
      setMessages(prevMessages => [...prevMessages, message])
      onChatUpdated()
      
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
    if (newMessage.trim() || attachments.length>0) {
      setSending(true)
      try {
        if (socket) {
          socket.emit(STOP_TYPING_EVENT, chat._id)
        }
              console.log(chat)
              const participant = chat.participants.find(p => p.username !== session?.user?.name);
              const recipientEmail = participant ? participant.email : null;

              const response = await sendMessage(chat._id, newMessage, attachments, currentUserId)
              console.log(session?.user?.name,recipientEmail)
              await messagesent(session?.user?.name,recipientEmail)
        setNewMessage('')
        // console.log(chat)

        if (socket) {
          socket.emit(MESSAGE_RECEIVED_EVENT, {
            ...response.data,
            chat: chat._id
          })
        }

        setMessages(prevMessages => [...prevMessages, response.data])
        setSending(false)
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
  // console.log(chat)

  return (
    <div className="fixed inset-0 bg-background z-[99999] flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        {/* <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={chat?.avatar?.url} alt={chat?.name} />
            <AvatarFallback>{chat?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{chat?.name}</span>
            {isTyping && (
              <span className="text-xs text-muted-foreground">typing...</span>
            )}
          </div>
        </div> */}
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea 
        className="flex-grow px-4 py-1 overflow-hidden" 
        ref={scrollAreaRef}
      >
        <div className="space-y-3 pb-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <p className="text-lg">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg?.sender?._id === currentUserId ? 'justify-end' : 'justify-start'
                  } group`}
                >
                  <div
                    className={`flex flex-col space-y-1 max-w-[85%] ${
                      msg?.sender?._id === currentUserId
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 px-2">
                      {msg?.sender?._id !== currentUserId && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={msg?.sender?.avatar?.url} alt={msg?.sender?.username} />
                          <AvatarFallback>{msg?.sender?.username[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {msg?.sender?.username} • {msg?.createdAt && !isNaN(new Date(msg?.createdAt).getTime())
                          ? format(new Date(msg?.createdAt), 'HH:mm')
                          : 'N/A'}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl break-words ${
                        msg?.sender?._id === currentUserId
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
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

      <div className="p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-10 flex-shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            className="flex-grow rounded-full"
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            className="rounded-full"
            disabled={!newMessage.trim()}
          >

      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
        </Button>


        </div>
        <div className='flex justify-center w-full p-2'>
        <Button className='rounded-lg bg-gray-100 w-2/3' onClick={onClose}>
          
          <ChevronDoubleDownIcon className='text-black'/>
        </Button>

        </div>
      
      </div>
    </div>
  )
}


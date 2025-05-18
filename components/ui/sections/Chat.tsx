"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChatWindow } from "./ChatWindow"
import { ChatList } from "./ChatList"
import { getUserChats, getAvailableUsers, createUserChat } from "./api"
import { Toaster, toast } from "react-hot-toast"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useSocket } from "./context/SocketContext"
import { setMobileChatOpen } from "@/app/libs/features/mobilefooter/footerSlice"
import { useAppDispatch, useAppSelector } from "@/app/libs/store/hooks"
import { useRouter } from "next/navigation"

const NEW_CHAT_EVENT = "newChat"
const CHAT_UPDATED_EVENT = "chatUpdated"
const USER_UPDATED_EVENT = "userUpdated"
const MESSAGE_RECEIVED_EVENT = "messageReceived"
const TYPING_EVENT = "typing"
const STOP_TYPING_EVENT = "stopTyping"

type ChatProps = {
  chatRecieverId?: string
}

export default function Chat({ chatRecieverId }: ChatProps) {
  const [chats, setChats] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarExtended, setIsSidebarExtended] = useState(false)
  const [currentUserId, setCurrentUserId] = useState()
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const { socket } = useSocket()
  const [refetchMessages, setRefetchMessages] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  // chatId ? setCurrentChat()
  const router = useRouter()

  const getUserChatId = useCallback(async (email) => {
    try {
      const res = await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${email}`)
      setCurrentUserId(res.data.data._id)
      return res.data.data._id
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to fetch user information")
    }
  }, [])

  const filteredUsers = useMemo(() => {
    return availableUsers.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [availableUsers, searchTerm])

  const handleCreateChat = async (receiverId) => {
    try {
      const response = await createUserChat(receiverId, currentUserId)
      const newChat = response.data.data
      setChats((prevChats) => [newChat, ...prevChats])
      setCurrentChat(newChat)
      setIsSidebarExtended(true)
      toast.success("Chat created successfully")
    } catch (error) {
      console.error("Error creating chat:", error)
      toast.error("Failed to create chat")
    }
  }
  useEffect(() => {
    async function gotochat() {
      if (chatRecieverId && currentUserId) {
        console.log("reciever id ", chatRecieverId)
        console.log("current user id ", currentUserId)
        const response = await createUserChat(chatRecieverId, currentUserId)
        const chat = response.data.data
        console.log("going to chat", chat)
        setCurrentChat(chat)
      }
    }
    gotochat()
  }, [chatRecieverId, currentUserId])

  const fetchChatsAndUsers = useCallback(async (currentUserId) => {
    try {
      const [chatsResponse, usersResponse] = await Promise.all([
        getUserChats(currentUserId),
        getAvailableUsers(currentUserId),
      ])
      setChats(chatsResponse.data.data)
      setAvailableUsers(usersResponse.data.data)
    } catch (error) {
      console.error("Error fetching chats and users:", error)
      toast.error("Failed to fetch chats and users")
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        setEmail(session.user.email)
        const id = await getUserChatId(session.user.email)
        if (id) {
          setCurrentUserId(id)
          await fetchChatsAndUsers(id)
        }
      }
    }

    fetchData()
  }, [session, getUserChatId, fetchChatsAndUsers])

  // Polling for chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserId) {
        // console.log('Polling for new chats and updates...');
        fetchChatsAndUsers(currentUserId) // Fetch updated chats and users
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [currentUserId, fetchChatsAndUsers])

  useEffect(() => {
    if (socket && currentUserId) {
      const handleNewChat = (newChat) => {
        setChats((prevChats) => [newChat, ...prevChats])
      }

      const handleChatUpdated = (updatedChat) => {
        setChats((prevChats) => prevChats.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat)))
      }

      const handleUserUpdated = (updatedUser) => {
        setAvailableUsers((prevUsers) => prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
      }

      const handleMessageReceived = (message) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === message.chat) {
              return {
                ...chat,
                lastMessage: message,
              }
            }
            return chat
          })
        })

        setCurrentChat((prevChat) => {
          if (prevChat && prevChat._id === message.chat) {
            return {
              ...prevChat,
              lastMessage: message,
            }
          }
          return prevChat
        })

        if (currentChat && currentChat._id !== message.chat) {
          toast.success(`New message from ${message.sender.username}`)
        }

        setRefetchMessages(true)
      }

      socket.on(NEW_CHAT_EVENT, handleNewChat)
      socket.on(CHAT_UPDATED_EVENT, handleChatUpdated)
      socket.on(USER_UPDATED_EVENT, handleUserUpdated)
      socket.on(MESSAGE_RECEIVED_EVENT, handleMessageReceived)
      socket.on(TYPING_EVENT, (chatId) => {
        if (currentChat && currentChat._id === chatId) setIsTyping(true)
      })
      socket.on(STOP_TYPING_EVENT, (chatId) => {
        if (currentChat && currentChat._id === chatId) setIsTyping(false)
      })

      return () => {
        socket.off(NEW_CHAT_EVENT)
        socket.off(CHAT_UPDATED_EVENT)
        socket.off(USER_UPDATED_EVENT)
        socket.off(MESSAGE_RECEIVED_EVENT)
        socket.off(TYPING_EVENT)
        socket.off(STOP_TYPING_EVENT)
      }
    }
  }, [socket, currentUserId, currentChat])
  // const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleUserCardClick = useCallback(
    (user) => {
      if (isMobileView) {
        // Route to the chat page instead of opening mobile chat window
        const chatId = user._id
        const receiverId = user.participants.find((p) => p._id !== currentUserId)?._id
        router.push(`/c/${chatId}?id=${currentUserId}&rid=${receiverId}`)
      } else {
        // Desktop behavior remains the same
        setIsSidebarExtended(true)
        setCurrentChat({
          _id: user._id,
          name: user.participants[0].username,
          isGroupChat: false,
          participants: user.participants,
          admin: user._id,
        })
        setRefetchMessages(true)
      }
    },
    [isMobileView, currentUserId, router],
  )

  const handleMessagesFetched = useCallback(() => {
    setRefetchMessages(false)
  }, [])

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === currentChat._id) {
            return {
              ...chat,
              messages: chat.messages.filter((message) => message._id !== messageId),
            }
          }
          return chat
        }),
      )
    },
    [currentChat],
  )

  // useEffect(() => {
  //   // Update mobile chat state whenever currentChat changes
  //   setIsMobileChatOpen(!!currentChat && isMobileView);
  // }, [currentChat, isMobileView]);
  const dispatch = useAppDispatch()
  const isMobileChatOpen = useAppSelector((state) => state.chat.isMobileChatOpen)

  const handleMobileChatToggle = (chat: any) => {
    dispatch(setMobileChatOpen(!!chat))
  }
  useEffect(() => {
    if (currentChat && !isMobileView) {
      const handleMobileChatToggle = () => {
        dispatch(setMobileChatOpen(true))
      }
      handleMobileChatToggle()
    }
  }, [currentChat, dispatch, isMobileView])

  return (
    <div className="flex h-screen w-full">
      <Toaster position="top-right" />

      {/* Sidebar */}
      {!currentChat && (
        <div className={`flex flex-col ${isSidebarExtended ? "w-1/3" : "w-full"} border-r`}>
          <div className="p-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            {searchTerm && (
              <ScrollArea className="max-h-40 mt-2 border rounded-md">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleCreateChat(user._id)}
                    >
                      {user.username}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No users found</div>
                )}
              </ScrollArea>
            )}
          </div>
          <ScrollArea className="flex-grow">
            <ChatList chats={chats} onSelectChat={handleUserCardClick} currentUserId={currentUserId} />
          </ScrollArea>
        </div>
      )}

      {/* Chat Window */}
      {currentChat && (
        <div className="w-full h-full">
          {isMobileView ? (
            // Route to chat page instead of showing MobileChatWindow
            <div className="flex items-center justify-center h-full">
              <p>Redirecting to chat...</p>
            </div>
          ) : (
            <ChatWindow
              chat={currentChat}
              currentUserId={currentUserId}
              chatRecieverId={currentChat.participants.filter((p) => p._id !== currentUserId)}
              onClose={() => {
                setCurrentChat(null)
                setIsSidebarExtended(false)
              }}
              onChatUpdated={() => setRefetchMessages(true)}
              refetchMessages={refetchMessages}
              onMessagesFetched={handleMessagesFetched}
              isTyping={isTyping}
              onDeleteMessage={handleDeleteMessage}
            />
          )}
        </div>
      )}
    </div>
  )
}

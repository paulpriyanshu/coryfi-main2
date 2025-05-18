import { getChatMessages, createUserChat } from "@/components/ui/sections/api"
import ChatInterface from "./chat-interface"


async function ChatPage({ params, searchParams }) {
  
  const chatId = params.cid
  const currentUserId = searchParams.id
  const receiverId = searchParams.rid
  
  // Fetch initial data on the server
  let chatData = null
  let initialMessages = []
  
  try {
    // Get chat details
    const chatResponse = await createUserChat(receiverId, currentUserId)
    chatData = chatResponse.data.data
    console.log("chat data",chatData)
    
    // Get initial messages
    if (chatId && currentUserId) {
      const messagesResponse = await getChatMessages(chatId, currentUserId)
      initialMessages = messagesResponse.data.data.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }
  } catch (error) {
    console.error("Error fetching initial data:", error)
    // Error handling will be done in the client component
  }

  return (
    <ChatInterface 
      chatId={chatId}
      currentUserId={currentUserId}
      // receiverId={receiverId}
      initialChat={chatData}
      initialMessages={initialMessages}
    />
  )
}
ChatPage.noHeader=true

export default ChatPage
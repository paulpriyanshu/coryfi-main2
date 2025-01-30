export interface Request {
    id: number
    senderName: string
    senderMail: string
    senderId: number
    type: string
    content: string
    isRead: boolean
    status?: "pending" | "accepted" | "rejected" | null
    createdAt: string
  }
  
  
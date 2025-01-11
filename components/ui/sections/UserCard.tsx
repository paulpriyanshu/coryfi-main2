import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// interface User {
//   _id: string
//   username: string
//   avatar?: string
// }

// interface UserCardProps {
//   user: User
//   onClick: () => void
// }

export function UserCard({ user, onClick }) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <CardContent className="flex items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.participants[0].username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold">{user.participants[0].username}</h4>
        </div>
      </CardContent>
    </Card>
  )
}


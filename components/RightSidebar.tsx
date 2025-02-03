import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function RightSidebar({ session, user }) {
  return (
    <Card className="bg-white shadow-lg sticky top-4">
      <CardContent className="p-6">
        {session ? (
          <div className="flex flex-col items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.image} alt="Your Profile" />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <Link href="/profile" className="font-bold text-black">
                {user?.name}
              </Link>
              <Link href="/settings/profile" passHref>
                <Button variant="link" className="text-black p-0 h-auto">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Link href="/api/auth/signin" passHref>
              <Button>Sign Up to view profile</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FeedRightSideBarButton from "./FeedRightSideBarButton";

export const FeedRightSidebar = async ({ user }: { user?: any }) => {


  return (
    <>
      <Card className="bg-white shadow-lg sticky top-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Profile</h2>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.userdp} alt="Your Profile" />
              <AvatarFallback>YP</AvatarFallback>
            </Avatar>
            <div>
              <FeedRightSideBarButton user={user} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
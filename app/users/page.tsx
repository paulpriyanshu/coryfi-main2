// pages/unconnected-users.tsx
import { Card, CardContent } from "@/components/ui/card";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Update this path to where your authOptions are defined
import UsersList from "@/components/ui/sections/UsersList";
import { getAllUnconnectedUsers } from "@/app/api/actions/media";

export default async function UnconnectedUsersPage() {
  // Fetch session on the server side
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email || "";
  console.log("user server email", userEmail);

  // Fetch unconnected users
  const users = userEmail ? await getAllUnconnectedUsers(userEmail) : [];
  console.log("users", users);

  if (!userEmail) {
    return <div>Please sign in first</div>;
  }

  return (
    <Card className="bg-white shadow-lg m-4">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">People You May Know</h1>
        {/* Pass data to client component */}
        <UsersList users={users} />
      </CardContent>
    </Card>
  );
}
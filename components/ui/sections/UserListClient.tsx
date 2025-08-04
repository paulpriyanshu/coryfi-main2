// app/components/UsersList/UsersListClient.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/libs/store/hooks";
import { setResponseData } from "@/app/libs/features/pathdata/pathSlice";

interface User {
  id: string;
  name: string;
  email: string;
  userdp: string;
}

interface UsersListProps {
  users: User[];
  findPath: (email: string) => Promise<any>;
}

export default function UsersList({ users }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleUserClick = async (user: User) => {
    try {
      router.push(`/userProfile/${user.id}`);
    } catch (error) {
      console.error("Error handling user click:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 dark:text-white">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="h-[calc(100vh-280px)]">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between mb-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors "
          >
            <div className="flex items-center space-x-4 ">
              <Avatar>
                <AvatarImage src={user.userdp} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm text-black dark:text-white">{user.name}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-black border-black hover:bg-slate-200  dark:hover:bg-slate-900 dark:text-white"
              onClick={() => handleUserClick(user)}
            >
              View
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
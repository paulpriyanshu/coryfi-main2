'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'react-hot-toast';
import axios from 'axios';

export function ChatList({ chats, onSelectChat, currentUserId }) {
  const [avatarUrls, setAvatarUrls] = useState({});

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!chats || chats.length === 0) return;

      try {
        const allParticipants = chats.flatMap(chat => 
          chat.participants.filter(p => p._id !== currentUserId)
        );

        for (const participant of allParticipants) {
          const response = await axios.get(
            `https://chat.coryfi.com/api/v1/users/getOneUserWithId/${participant._id}`
          );

          const avatarUrl = response.data.data.avatar?.url;

          setAvatarUrls(prev => ({
            ...prev,
            [participant._id]: avatarUrl || "https://via.placeholder.com/200x200.png"
          }));
        }
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
        toast.error("Failed to load user avatars");
      }
    };

    fetchAvatars();
  }, [chats, currentUserId]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="space-y-4 p-2 sm:p-4">
          <h3 className="font-semibold text-base sm:text-lg">Your Chats</h3>
          {chats.map((chat) => {
            const receiver = chat.participants.find(
              participant => participant._id !== currentUserId
            );

            return (
              <Card
                key={chat._id}
                className="cursor-pointer hover:bg-muted/50 dark:bg-gray-700"
                onClick={() => onSelectChat(chat)}
              >
                <CardContent className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <img
                      src={avatarUrls[receiver?._id]}
                      alt={receiver?.username || "User"}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200x200.png";
                      }}
                    />
                    <AvatarFallback>
                      {receiver?.username ? receiver.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base">
                      {receiver?.username || "Unknown User"}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ChatList;
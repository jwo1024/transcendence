import React from "react";
import { Frame, ThemeProvider, List } from "@react95/core";

interface FriendStatusProps {
  nickname: string;
  status: string;
}
interface FriendListProps {
  friends: FriendStatusProps[];
}

const FriendList: React.FC<FriendListProps> = ({ friends }) => {
  return (
    <ThemeProvider>
      <Frame w={500} h={600} padding={4} className="flex flex-col p-4">
        <div className="overflow-y-auto flex-grow">
          <List className=" space-y-2">
            {friends.map((friend, index) => (
              <List.Item key={index} className="flex justify-between">
                <strong>{friend.nickname}</strong>
                <span>{friend.status}</span>
              </List.Item>
            ))}
          </List>
        </div>
      </Frame>
    </ThemeProvider>
  );
};

export default FriendList;

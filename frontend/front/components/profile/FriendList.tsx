import React from "react";
import { Frame, ThemeProvider, List, Input, Button } from "@react95/core";
import { Fax } from "@react95/icons";

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
      <Frame w={330} h={400} padding={4} className="flex flex-col">
        <div className="overflow-y-auto flex-grow p-5">
          <List className=" space-y-2">
            {friends.map((friend, index) => (
              <List.Item key={index} className="flex justify-between">
                <List>
                  <List.Item>
                    <span>귓속말</span>
                  </List.Item>
                  <List.Item>
                    <span>친구삭제</span>
                  </List.Item>
                </List>
                <strong>{friend.nickname}</strong>
                <span>{friend.status}</span>
              </List.Item>
            ))}
          </List>
        </div>
        <div className="flex items-center justify-between p-4 pt-4 border-2 border-white">
          <Input className=" w-60" />
          <Button>친구추가</Button>
        </div>
      </Frame>
    </ThemeProvider>
  );
};

export default FriendList;

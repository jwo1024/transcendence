import React, { useEffect, useState } from "react";
import { Frame, ThemeProvider, List, Input, Button } from "@react95/core";
import { Fax } from "@react95/icons";
import Window from "../common/Window";

// 임시 백엔드 타입용.
type friend = {
  nickname: string;
  state: string;
};
type friends = friend[];

const FriendList: React.FC = () => {
  const [friendsList, setFriendsList] = useState<friends>([]);
  useEffect(() => {
    fetch("http://localhost:3001/api/friendList")
      .then((res) => res.json())
      .then((res) => {
        setFriendsList(res);
      });
  }, []);
  return (
    <Window title="Friend List" w="370" h="620">
      <div className="overflow-auto flex-grow p-1">
        <ul className="space-y-2 w-full">
          {friendsList.map((friend, index) => (
            <List.Item
              key={index}
              className="flex w-full items-center justify-between"
            >
              <strong>{friend.nickname}</strong>
              <div className="flex items-center space-x-2">
                <span>{friend.state}</span>
                <Button className=" h-7 flex items-center justify-center">
                  프로필 보기
                </Button>
              </div>
            </List.Item>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between p-4 pt-4 border-2 border-white">
        <Input className=" w-60" />
        <Button>친구추가</Button>
      </div>
    </Window>
  );
};

export default FriendList;

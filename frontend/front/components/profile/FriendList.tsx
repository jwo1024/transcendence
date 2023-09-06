import React, { useEffect, useState } from "react";
import { Frame, ThemeProvider, List, Input, Button } from "@react95/core";
import { Fax } from "@react95/icons";
import Window from "../common/Window";

// 임시 백엔드 타입용.
type user = {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  win: number;
  lose: number;
};
type users = user[];

interface FriendListProps {
  handleProfileClick: (friend: user) => void;
}

const FriendList: React.FC<FriendListProps> = ({ handleProfileClick }) => {
  // load friend list....
  const [friendsList, setFriendsList] = useState<users>([]);
  useEffect(() => {
    fetch("http://localhost:3001/api/friendList")
      .then((res) => res.json())
      .then((res) => {
        setFriendsList(res);
      });
  }, []);

  // request plus friend
  const addFriend = () => {
    fetch("http://localhost:3001/api/friendsList");
  };

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
                <Button
                  onClick={() => handleProfileClick(friend)}
                  className=" h-7 flex items-center justify-center"
                >
                  프로필 보기
                </Button>
              </div>
            </List.Item>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between p-4 pt-4 border-2 border-white">
        <Input className=" w-60" />
        {/* <Button onClick={addFriend}>친구추가</Button> */}
        <Button>친구추가</Button>
      </div>
    </Window>
  );
};

export default FriendList;

import React from "react";
import {
  Fieldset,
  Frame,
  ThemeProvider,
  TitleBar,
  Button,
} from "@react95/core";
import Window from "../common/Window";

type user = {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  win: number;
  lose: number;
};

interface ProfileProps {
  selectedFriend: user;
}

const FriendProfile: React.FC<ProfileProps> = ({ selectedFriend }) => {
  const myProfile: boolean = true;
  return (
    <Window title="Friend Profile" w="320" h="260">
      <div className=" flex flex-col items-center justify-between p-4 pb-1">
        <div className="flex items-center space-x-8">
          <img
            src={selectedFriend.avatarSrc}
            alt="Avatar"
            className=" w-32 h-32"
          />
          <div className="flex flex-col items-center space-y-3 w-28">
            <span className=" text-3xl">{selectedFriend.nickname}</span>
          </div>
        </div>
      </div>
      <div className="p-4 w-full">
        <Fieldset legend="Information">
          <div className="flex flex-col p-2">
            <div>Ladder: {selectedFriend.ladder}</div>
            <div>Win: {selectedFriend.win}</div>
            <div>Lose: {selectedFriend.lose}</div>
          </div>
        </Fieldset>
      </div>
    </Window>
  );
};

export default FriendProfile;

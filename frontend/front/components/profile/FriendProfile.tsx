import React from "react";
import {
  Fieldset,
  Frame,
  ThemeProvider,
  TitleBar,
  Button,
} from "@react95/core";
import Window from "../common/Window";

interface ProfileProps {
  nickname: string;
  ladder: number;
  win: number;
  lose: number;
  avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
}

const FriendProfile: React.FC<ProfileProps> = ({
  nickname,
  ladder,
  win,
  lose,
  avatarSrc,
}) => {
  const myProfile: boolean = true;
  return (
    <Window title="Friend Profile" w="300" h="300">
      <div className=" flex flex-col items-center justify-between p-4 space-y-4">
        <div className="flex items-center space-x-8">
          <img src={avatarSrc} alt="Avatar" className=" w-32 h-32" />
          <div className="flex flex-col items-center space-y-3">
            <span className=" text-3xl">{nickname}</span>
          </div>
        </div>
      </div>
      <div className="p-4 w-full">
        <Fieldset legend="Information">
          <div className="flex flex-col p-2">
            <div>Ladder: {ladder}</div>
            <div>Win: {win}</div>
            <div>Lose: {lose}</div>
          </div>
        </Fieldset>
      </div>
    </Window>
  );
};

export default FriendProfile;

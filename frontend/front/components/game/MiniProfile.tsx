import React from "react";
import { Frame, ThemeProvider, TitleBar } from "@react95/core";

interface MiniProfileProps {
  nickname: string;
  ladder: number;
  win: number;
  lose: number;
  avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
}

const MiniProfile: React.FC<MiniProfileProps> = ({
  nickname,
  ladder,
  win,
  lose,
  avatarSrc,
}) => {
  return (
    <ThemeProvider>
      <Frame w={300} h={200} padding={4}>
        <div className="p-4 flex items-center">
          <div className="flex-grow">
            <div className="font-bold text-lg">{nickname}</div>
            <div>Ladder: {ladder}</div>
            <div>Win: {win}</div>
            <div>Lose: {lose}</div>
          </div>
          <img src={avatarSrc} alt="Avatar" className="w-20 h-20 ml-20" />
        </div>
      </Frame>
    </ThemeProvider>
  );
};

export default MiniProfile;

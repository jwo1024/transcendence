import React from "react";
import { Frame, ThemeProvider } from "@react95/core";

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
      <Frame w={300} h={130} padding={5}>
        <div className="py-4 px-10 flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="font-bold text-2xl">{nickname}</div>
            <div>
              <div>Ladder: {ladder}</div>
              <div>Win: {win}</div>
              <div>Lose: {lose}</div>
            </div>
          </div>
          <img src={avatarSrc} className="w-20 h-20 ml-20" />
        </div>
      </Frame>
    </ThemeProvider>
  );
};

export default MiniProfile;

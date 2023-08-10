import React from "react";
import { Frame, ThemeProvider, TitleBar } from "@react95/core";

interface ProfileProps {
  nickname: string;
  ladder: number;
  win: number;
  lose: number;
  avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
}

const DetailProfile: React.FC<ProfileProps> = ({
  nickname,
  ladder,
  win,
  lose,
  avatarSrc,
}) => {
  const myProfile: boolean = true;
  return (
    <ThemeProvider>
      <Frame w={500} h={600} padding={4} className="flex flex-col p-4">
        <div className=" flex items-center justify-between">
          <img src={avatarSrc} alt="Avatar" className="w-20 h-20 m-10" />
          <div className="flex flex-col space-y-3 mr-20">
            <Frame w={150} h={50} />
            <Frame w={150} h={50} />
          </div>
        </div>
        <div></div>
      </Frame>
    </ThemeProvider>
  );
};

export default DetailProfile;

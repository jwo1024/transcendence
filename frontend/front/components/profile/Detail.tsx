import React from "react";
import { Fieldset, Frame, ThemeProvider, TitleBar } from "@react95/core";

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
      <Frame w={400} h={400} padding={4} className="flex flex-col min-w-max">
        <div className=" flex flex-col items-center justify-between p-12 pb-0 space-y-3">
          <img src={avatarSrc} alt="Avatar" className="w-40 h-40" />
          <div className="flex items-center justify-center space-x-4">
            <Frame className="flex items-center justify-center">
              <span className="font-bold py-2 px-1">닉네임 변경</span>
            </Frame>
            <Frame className="flex items-center justify-center">
              <span className="font-bold py-2 px-1">아바타 변경</span>
            </Frame>
          </div>
          <Frame className="flex">
            <span className="font-bold py-2 px-5">2차 인증</span>
          </Frame>
        </div>
        <div className="p-4 pt-8">
          <Fieldset legend="Information">
            <div className="flex flex-col p-2">
              <div>Ladder: {ladder}</div>
              <div>Win: {win}</div>
              <div>Lose: {lose}</div>
            </div>
          </Fieldset>
        </div>
      </Frame>
    </ThemeProvider>
  );
};

export default DetailProfile;

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
      <Frame w={400} h={400} padding={4} className="flex flex-col">
        <div className=" flex items-center justify-between p-12">
          <img src={avatarSrc} alt="Avatar" className="w-32 h-32" />
          <div className="flex flex-col space-y-4">
            <div>
              <Frame
                w={180}
                h={50}
                className="flex items-center justify-center"
              >
                <span className="font-bold">닉네임 변경</span>
              </Frame>
            </div>
            <div>
              <Frame
                w={180}
                h={50}
                className="flex items-center justify-center"
              >
                <span className="font-bold">아바타 변경</span>
              </Frame>
            </div>
          </div>
        </div>
        <div className="p-4 mt-8">
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

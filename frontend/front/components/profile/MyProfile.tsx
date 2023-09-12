import React from "react";
import {
  Fieldset,
  Frame,
  ThemeProvider,
  TitleBar,
  Button,
  Input,
} from "@react95/core";
import Window from "../common/Window";

interface ProfileProps {
  nickname: string;
  ladder: number;
  win: number;
  lose: number;
  avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
}

const MyProfile: React.FC<ProfileProps> = ({
  nickname,
  ladder,
  win,
  lose,
  avatarSrc,
}) => {
  const myProfile: boolean = true;
  return (
    <Window title="My Profile" w="320" h="350">
      <div className=" flex flex-col items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <img src={avatarSrc} alt="Avatar" className=" w-32 h-32" />
          <div className="flex flex-col items-center space-y-3 w-28">
            <span className=" text-3xl">{nickname}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-1 px-4">
        <form
          className="flex flex-col space-y-1 p-0.5 items-center"
          // onSubmit={onSubmitAvatar}
        >
          <Input
            placeholder="Avatar"
            type="file"
            accept=".jpg, .png, image/jpeg, image/png"
            className="w-full text-gray-200 file:mr-4 
                    file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-300"
            // onChange={onChangeAvatarInput}
            w=""
            h=""
          />
          <Button className="w-full">아바타 변경</Button>
        </form>
        <div className="flex flex-col space-y-1 p-0.5 items-center">
          <Input placeholder="Nick Name" className="flex-1 w-32" />
          <Button className="w-full">닉네임 변경</Button>
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

export default MyProfile;

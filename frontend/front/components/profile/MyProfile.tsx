import React, { useEffect, useRef, useState } from "react";
import {
  Fieldset,
  Frame,
  ThemeProvider,
  TitleBar,
  Button,
  Input,
} from "@react95/core";
import Window from "../common/Window";
import { UserLocalStorage } from "@/types/SignUpType";
import sendAvatar from "../common/sendAvatar";
import type { SignupDto, User42Dto } from "@/types/SignUpType";
import imageCompression from "browser-image-compression";

interface ProfileProps {
  avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
}
const actionImgCompress = async (fileSrc: File) => {
  const options = {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 140,
    useWebWorker: true,
  };
  try {
    return await imageCompression(fileSrc, options);
  } catch (error) {
    alert(error);
    return null;
  }
};

const MyProfile: React.FC<ProfileProps> = ({ avatarSrc }) => {
  const [myData, setMydata] = useState<UserLocalStorage>({
    id: 0,
    nickname: "",
    status: 0,
    ladder: 0,
    wins: 0,
    loses: 0,
  });

  const myProfile: boolean = true;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const user = localStorage.getItem("user");
    const user_obj = JSON.parse(localStorage.getItem("user") || "{}");
    setMydata(user_obj);
  }, []);

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);

  const onChangeAvatarInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let file = event.target.files ? event.target.files[0] : null;
    if (!file) return console.log("no image");
    setUploadAvatar(file);
    console.log(`${file?.size} byte`);

    if (file?.size > 140 * 140) {
      file = await actionImgCompress(file);
    }
    console.log(`${file?.size} byte`);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarURL(url);
    }
  };

  const onSubmitAvatar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      fetch(`${backendUrl}/auth/defaultAvatar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            res.blob().then((blob) => {
              setUploadAvatar(blob as File); // 이게 맞나 ? typeScript as
              const url = URL.createObjectURL(blob);
              setAvatarURL(url);
              sendAvatar({ setAvatarURL, uploadAvatar });
            });
          } else {
            console.log("확인");
            setAvatarURL("");
          }
        })
        .catch((error) => {
          setAvatarURL("");
          console.error("이미지를 불러오는 동안 오류 발생: ", error);
        });
    }
  };

  const [newNickName, setNewNickName] = useState<string | null>(null);

  const onSubmitNickname = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newNickNameInputRef = useRef<HTMLInputElement>();
    const handleBlurInput = () => {
      setNewNickName(newNickNameInputRef.current?.value || "");
    };
  };
  return (
    <Window title="My Profile" w="320" h="350">
      <div className=" flex flex-col items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <img src={avatarSrc} alt="Avatar" className=" w-32 h-32" />
          <div className="flex flex-col items-center space-y-3 w-28">
            <span className=" text-3xl">{myData.nickname}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-1 px-4">
        <form
          className="flex flex-col space-y-1 p-0.5 items-center"
          onSubmit={onSubmitAvatar}
        >
          <Input
            placeholder="Avatar"
            type="file"
            accept=".jpg, .png, image/jpeg, image/png"
            className="w-full text-gray-200 file:mr-4 
                    file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-300"
            onChange={onChangeAvatarInput}
            w=""
            h=""
          />
          <Button className="w-full">아바타 변경</Button>
        </form>
        <form
          className="flex flex-col space-y-1 p-0.5 items-center"
          onSubmit={onSubmitAvatar}
        >
          <Input placeholder="Nick Name" className="flex-1 w-32" />
          <Button className="w-full">닉네임 변경</Button>
        </form>
      </div>
      <div className="p-4 w-full">
        <Fieldset legend="Information">
          <div className="flex flex-col p-2">
            <div>Ladder: {myData.ladder}</div>
            <div>Win: {myData.wins}</div>
            <div>Lose: {myData.loses}</div>
          </div>
        </Fieldset>
      </div>
    </Window>
  );
};

export default MyProfile;

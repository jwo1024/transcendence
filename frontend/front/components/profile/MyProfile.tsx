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

// interface ProfileProps {
//   avatarSrc: string; // 아바타 이미지 경로를 받는 속성 추가
// }
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

const MyProfile: React.FC = () => {
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

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);

  const [profileAvatarSrc, setProfileAvatarSrc] = useState<string | undefined>(
    "https://github.com/React95.png"
  );

  useEffect(() => {
    const user = localStorage.getItem("user");
    const user_obj = JSON.parse(localStorage.getItem("user") || "{}");
    setMydata(user_obj);

    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.blob();
        else throw new Error("Failed to fetch image");
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setProfileAvatarSrc(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }, []);

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
    sendAvatar({ setAvatarURL, uploadAvatar });

    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.blob();
        else throw new Error("Failed to fetch image");
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setProfileAvatarSrc(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  const [newNickName, setNewNickName] = useState<string | null>(null);

  const onSubmitNickname = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newNickNameInputRef = useRef<HTMLInputElement>();
    const handleBlurInput = () => {
      setNewNickName(newNickNameInputRef.current?.value || "");
    };

    // localStorage의 "user"는 여기 페이지 상에서 myData라는 변수로 저장되있음
    //현재 닉네임은 myData.nickname;
    // 새 닉네임은 newNickName

    // 닉변성공시;
    // {
    //   const user = localStorage.getItem("user");
    //   const user_obj = JSON.parse(localStorage.getItem("user") || "{}");

    //   // setMyData를 하면 컴포넌트가 자동 업데이트 될 것임.
    //   setMydata({ ...user_obj, nickname: newNickName });

    //   // 로컬스토리지를 비우고 새로 업데이트
    //   localStorage.clear();
    //   localStorage.setItem("user", JSON.stringify(myData));
    // }
    // 실패시;
    // {
    //   alert("닉네임 변경 실패(ex. 중복된 닉네임, 유효하지않은 닉네임)");
    // }
  };
  return (
    <Window title="My Profile" w="320" h="350">
      <div className=" flex flex-col items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <img src={profileAvatarSrc} alt="Avatar" className=" w-32 h-32" />
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
          onSubmit={onSubmitNickname}
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

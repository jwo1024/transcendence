import React, { useEffect, useRef, useState } from "react";
import { Fieldset, Button, Input } from "@react95/core";
import Window from "../common/Window";
import { UserSessionStorage } from "@/types/SignUpType";
import sendAvatar from "../func/sendAvatar";
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
  const [myData, setMydata] = useState<UserSessionStorage>({
    id: 12,
    nickname: "",
    status: 0,
    ladder: 0,
    wins: 0,
    loses: 0,
  });

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);

  const newNickNameInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const user_obj = JSON.parse(sessionStorage.getItem("user") || "{}");
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
        setAvatarURL(imageUrl);
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
    if (!uploadAvatar) {
      alert("변경할 아바타가 등록되지 않았습니다.");
      return;
    }
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
        setAvatarURL(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  const onSubmitNickname = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nickname = newNickNameInputRef.current?.value;
    if (nickname == "") return alert("비었잖아..");
    if (nickname == myData.nickname) return alert("같은 닉네임이잖아..");
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/rename`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rename: nickname }),
    })
      .then((res) => {
        if (res.status == 409)
          return alert(
            "이미 존재하는 닉네임입니다. 다른 닉네임을 입력해주세요."
          );
        else if (res.ok) {
          const user_obj = JSON.parse(sessionStorage.getItem("user") || "{}");
          setMydata({ ...user_obj, nickname: nickname });
          return alert("닉네임이 변경되었습니다.");
        } else return alert("오마이갓 비상사태 큰일났다");
      })
      .catch((error) => {
        console.error("Error while change nickname:", error);
        alert("에러발생했잔아");
      });
  };

  useEffect(() => {
    sessionStorage.setItem("user", JSON.stringify(myData));
  }, [myData]);

  return (
    <Window
      title="My Profile"
      w="320"
      h="350"
      xOption={false}
      minimizeOption={false}
    >
      <div className=" flex flex-col items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <img src={avatarURL!} alt="Avatar" className=" w-32 h-32" />
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
          <Button className="w-full">Avatar Confirm</Button>
        </form>
        <form
          className="flex flex-col space-y-1 p-0.5 items-center"
          onSubmit={onSubmitNickname}
        >
          <Input
            placeholder="Nick Name"
            className="flex-1 w-32"
            ref={newNickNameInputRef}
          />
          <Button className="w-full">Confirm</Button>
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

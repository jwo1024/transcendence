import { Frame, Input, Button } from "@react95/core";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import type { User42Dto } from "@/types/SignUpType";

const AvatarBlock = ({ user42Dto }: { user42Dto: User42Dto }) => {
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      fetch(`${backendUrl}/profile/images/${user42Dto?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            res.blob().then((blob) => {
              const url = URL.createObjectURL(blob);
              setAvatarURL(url);
            });
          } else setAvatarURL("");
        })
        .catch((error) => {
          setAvatarURL("");
          console.error("이미지를 불러오는 동안 오류 발생: ", error);
        });
    }
  }, []);

  const onSubmitAvatar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", uploadAvatar as Blob); // 필드 이름을 'image'로 변경
    formData.append("ext", `.${uploadAvatar?.name?.split(".").pop()}`);
    const token = sessionStorage.getItem("accessToken");
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/images/${user42Dto?.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )
      .then((res) => {
        if (res.ok) {
          // console.log("이미지 업로드 성공");
          setAvatarURL(URL.createObjectURL(uploadAvatar as Blob)); // as 써도 괜찮을까?
        } else setAvatarURL(""); // console.error("이미지 업로드 실패");
      })
      .catch((err) => {
        setAvatarURL("");
        console.error(err);
      });
  };

  const onChangeAvatarInput = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadAvatar(() => (event.target.files ? event.target.files[0] : null));
  };

  return (
    <>
      <label>AVATAR 이미지 업로드 </label>
      <div className="flex flex-row items-center">
        <Frame className=" w-20 h-20" boxShadow="in" w="" h="">
          <img
            src={avatarURL ? avatarURL : "https://github.com/React95.png"}
            alt="photo"
            className="object-cover w-full h-full"
          />
          {avatarURL === "" ? <span>이미지 에러</span> : null}
        </Frame>
        <form className="flex flex-col m-1" onSubmit={onSubmitAvatar}>
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
          <Button className="px-5">Upload</Button>
        </form>
      </div>
    </>
  );
};

export default AvatarBlock;

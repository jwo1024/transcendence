import { Frame, Input } from "@react95/core";
import { useEffect } from "react";

interface AvatarBlockProps {
  avatarURL: string | null;
  setAvatarURL: React.Dispatch<React.SetStateAction<string | null>>;
  setUploadAvatar: React.Dispatch<React.SetStateAction<File | null>>;
}

const AvatarBlock = ({
  avatarURL,
  setAvatarURL,
  setUploadAvatar,
}: AvatarBlockProps) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
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
  }, []);

  const onChangeAvatarInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setUploadAvatar(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarURL(url);
    }
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
        <Input
          placeholder="Avatar"
          type="file"
          accept=".jpg, .png, image/jpeg, image/png"
          className="w-full h-full text-gray-200 file:mr-4 
				  file:h-full file:px-4 file:border-0 file:text-sm file:font-semibold
				file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-300"
          onChange={onChangeAvatarInput}
          w=""
          h=""
        />
      </div>
    </>
  );
};

export default AvatarBlock;

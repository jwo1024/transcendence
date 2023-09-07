import Link from "next/link";
import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";
import { Button, Input, Avatar, Frame } from "@react95/core";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useRouter } from "next/router";
import { getCookieParser } from "next/dist/server/api-utils";
import { request } from "http";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import Cookies from "js-cookie";
// import { access } from "fs";

interface User42Dto {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  campus: string;
} // data from backend

// interface SignUpDto {
//   id: number;
//   nickname: string;
//   enable2FA: boolean;
//   data2FA: string;
// } // send to backend

const InfoBlockLayout = ({
  menu,
  value,
}: {
  menu?: string;
  value?: string;
}) => {
  return (
    <div className="flex flex-row ">
      <Frame
        className=" w-20 text-center border border-black px-p-2px mr-1	font-extrabold"
        w=""
      >
        {menu}
      </Frame>
      <Frame
        className="flex-1 pl-3 border border-black bg-zinc-400"
        boxShadow="in"
        bg=""
      >
        {value}
      </Frame>
    </div>
  );
};

const SignUpPage = () => {
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const [nickNameIsNotValid, setNickNameIsNotValid] = useState<boolean>(false);
  const [userAlreadyExist, setUserAlreadyExist] = useState<boolean>(false);
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);
  const router = useRouter();
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);

  useEffect(() => {
    const data = JSON.parse(Cookies.get("user42Dto"));
    setUser42Dto({
      id: data.id,
      login: data.login,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      campus: data.campus,
    });

    fetch(`http://localhost:4000/auth/images/${data.id}`)
      .then((response) => {
        if (response.ok) {
          const blob = response.blob().then((blob) => {
            const url = URL.createObjectURL(blob);
            setAvatarURL(url);
          });
        } else {
          console.error("이미지를 불러올 수 없습니다.");
        }
      })
      .catch((error) => {
        {
          console.error("이미지를 불러오는 동안 오류 발생: ", error);
        }
      });
  }, []);

  // send SignUpDto to backend
  const handleSubmitSignUP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (nicknameInputRef.current?.value === "") {
      setNickNameIsNotValid(false);
      return;
    }
    //const data = Cookies.get('accessToken');
    const token = JSON.parse(Cookies.get("accessToken"));
    // API 요청을 보낼 때 JWT 토큰을 헤더에 포함
    console.log("data", Cookies.get("accessToken"));

    fetch("http://localhost:4000/profile/signup", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // 꼭 첨부해야함!
      },
      body: JSON.stringify({
        id: user42Dto?.id,
        nickname: nicknameInputRef.current?.value,
        enable2FA: false,
        data2FA: "what should i put here?",
      }),
    })
      .then((res) => {
        if (res.ok) {
          setNickNameIsNotValid(false);
          Cookies.remove("user42Dto");
          router.push("http://localhost:3001/menu");
        } else {
          res
            .text()
            .then((text) => JSON.parse(text).message)
            .then((msg) => {
              if (msg === "user already exists") {
                setUserAlreadyExist(true);
              } else if (msg === "duplicated nickname") {
                setNickNameIsNotValid(true);
              }
            });
          throw new Error(`Custom Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .catch((err) => console.log("FAILED " + err));
  };

  const onSubmitAvatar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("id", user42Dto?.id.toString() || "failed");
    formData.append("file", uploadAvatar || "failed");
    const token = JSON.parse(Cookies.get("accessToken"));
    fetch("http://localhost:4000/auth/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: "http://localhost:3001",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          console.log("이미지 업로드 성공");
        } else {
          console.error("이미지 업로드 실패");
        }
      })
      .catch((err) => console.error(err));
  };

  const onChangeAvatarInput = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadAvatar(event.target.files ? event.target.files[0] : null);
    if (uploadAvatar)
      console.log("uploadAvatar", uploadAvatar, uploadAvatar.name);
    else
      console.log("uploadAvatar onChaneFailed", uploadAvatar);
  };

  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Window title="Sign in Page" w="300" h="480">
        <div className="flex flex-col space-y-3 m-3 items-right">
          {/* user 42 Dto */}
          <div>
            안녕하세요 ! {user42Dto?.login} 님
            <div className="flex flex-col border border-black mx-5 p-0.5 p-x-1 space-y-1">
              <InfoBlockLayout menu="id" value={user42Dto?.id.toString()} />
              <InfoBlockLayout menu="login" value={user42Dto?.login} />
              <InfoBlockLayout menu="email" value={user42Dto?.email} />
              <InfoBlockLayout
                menu="first name"
                value={user42Dto?.first_name}
              />
              <InfoBlockLayout menu="last name" value={user42Dto?.last_name} />
              <InfoBlockLayout menu="campus" value={user42Dto?.campus} />
            </div>
          </div>

          {/* Sign UP Form */}

          {/* nickName */}
          <label>👻 유저 닉네임을 설정해 주세요 👀</label>
          <div className="flex flex-row space-y-1 p-0.5 items-center">
            <Input
              placeholder="Nick Name"
              ref={nicknameInputRef}
              className="flex-1 "
            />
          </div>
          {nickNameIsNotValid === true ? (
            <div className="px-5 text-green-700">
              {" "}
              유효하지 않은 닉네임 입니다
            </div>
          ) : null}

          {/* avatar */}
          <label>AVATAR 이미지 업로드 </label>
          <div className="flex flex-row items-center">
            <Frame className="w-20 h-20" boxShadow="in">
              <img
                src={avatarURL ? avatarURL : "https://github.com/React95.png"}
                alt="photo"
                className="object-cover"
              />
            </Frame>
            {/* <Avatar src={avatarURL? avatarURL:"https://github.com/React95.png"} alt="photo" className="object-cover"/> */}
            <form
              className="flex flex-col m-1 flex-1"
              onSubmit={onSubmitAvatar}
            >
              <Input
                placeholder="Avatar"
                type="file"
                accept=".jpg, .png, image/jpeg, image/png"
                className="flex-1 text-gray-200 file:mr-4 
                    file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-300"
                onChange={onChangeAvatarInput}
              />
              <Button className="px-5">Upload</Button>
            </form>
          </div>
          <br />

          {/* Sign - Up */}
          <form onSubmit={handleSubmitSignUP} className="w-full">
            <div className=" text-center">
              <Button>Sign - up</Button>
              {userAlreadyExist === true ? (
                <div className="px-5 text-green-700">
                  야 너 누구야! (tmp frontend 가 언젠가 에러페이지를 띄우고
                  home으로 돌아가게 만들 것임)
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </Window>
    </div>
  );
};

export default SignUpPage;

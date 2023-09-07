import Link from "next/link";
import Window from "@/components/common/Window";
import { Button, Input, Avatar, Frame } from "@react95/core";
import { useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useRouter } from "next/router";

interface User42Dto {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  campus: string;
} // data from backend

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
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const [nickNameIsValid, setNickNameIsValid] = useState<boolean | null>(null);
  const router = useRouter();

  const isUser42Dto = (data: any): data is User42Dto => {
    return (
      typeof data === "object" &&
      "id" in data &&
      "login" in data &&
      "first_name" in data &&
      "last_name" in data &&
      "campus" in data
    );
  };
  // useMutation

  // get user42Dto from backend in query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (
      !params.has("id") ||
      !params.has("login") ||
      !params.has("email") ||
      !params.has("first_name") ||
      !params.has("last_name") ||
      !params.has("campus")
    ) {
      setUser42Dto({
        id: 98123,
        login: "jiwolee",
        email: "jiwolee@student.42seoul.kr",
        first_name: "Jiwoo",
        last_name: "Lee",
        campus: "Seoul",
      });
    } else {
      setUser42Dto({
        id: Number(params.get("id")),
        login: params.get("login") || "",
        email: params.get("email") || "",
        first_name: params.get("first_name") || "",
        last_name: params.get("last_name") || "",
        campus: params.get("campus") || "",
      });
    }
  }, []);

  // send SignUpDto to backend
  const onSubmitNickName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const onSubmitAvatar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClickSignUP = () => {
    fetch("http://localhost:3001/api/signup", {
      method: "POST",
      body: JSON.stringify({
        id: user42Dto?.id,
        nickname: nicknameInputRef.current?.value,
        enable2FA: false,
        data2FA: "what should i put here?",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.message === "OK") {
          setNickNameIsValid(true);
          // tmp 기존 데이터 삭제 후 재설정
          if (localStorage.getItem("user")) localStorage.removeItem("user");
          localStorage.setItem("user", data.data);
          router.push("http://localhost:3001/menu");
        }
      })
      .catch((err) => console.log("FAILED" + err));
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

          {/* nick-name */}
          <form onSubmit={onSubmitNickName} className="w-full">
            <label>👻 유저 닉네임을 설정해 주세요 👀</label>
            <div className="flex flex-row space-y-1 p-0.5 items-center">
              <Input
                placeholder="Nick Name"
                ref={nicknameInputRef}
                className="flex-1 "
              />
              <Button className="">Check</Button>
            </div>
            {nickNameIsValid === true ? (
              <div className="px-5 text-green-700">유효한 닉네임 입니다</div>
            ) : nickNameIsValid === false ? (
              <div className="px-5 text-red-700">
                유효하지 않은 닉네임 입니다
              </div>
            ) : null}
          </form>

          {/* avatar */}
          <form onSubmit={onSubmitAvatar}>
            <label>AVATAR 이미지 업로드 </label>
            <div className="flex flex-row items-center">
              <Frame className=" w-20 h-20" boxShadow="in" w="" h="">
                <img
                  src={"https://github.com/React95.png"}
                  alt="photo"
                  className="object-contain w-full f-full"
                />
              </Frame>
              {/* <Avatar src="https://github.com/React95.png" alt="photo" /> */}
              <div className="flex flex-col m-1 ">
                <Input
                  placeholder="Avatar"
                  type="file"
                  accept=".jpg, .png, image/jpeg, image/png"
                  className=" w-full text-gray-200 file:mr-4 
                    file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-300"
                  w=""
                  h=""
                />
                <Button className="px-5">Upload</Button>
              </div>
            </div>
          </form>
          <br />

          {/* Sign - Up */}
          <div className=" text-center">
            <Link href="/">
              <Button onClick={handleClickSignUP}>Sign - up</Button>
            </Link>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default SignUpPage;

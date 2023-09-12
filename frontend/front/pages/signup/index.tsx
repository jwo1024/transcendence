import Window from "@/components/common/Window";
import { Button, Input, Frame } from "@react95/core";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import InfoBlock from "@/components/signup/InfoBlock";
import AvatarBlock from "@/components/signup/AvatarBlock";
import NickNameBlock from "@/components/signup/NickNameBlock";
import { User42Dto } from "@/types/User42Dto";
import type { UserInfo } from "@/types/UserInfo";

const SignUpPage = () => {
  const router = useRouter();
  const [nickName, setNickName] = useState<string | null>(null);
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);
  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;

  useEffect(() => {
    console.log("CHECK : SignUpPage : MOUNT");
    return () => {
      console.log("CHECK : SignUpPage : UNMOUNT");
    }
  }, []);
  console.log("CHECK : SignUpPage : RENDER");

  // send SignUpDto to backend
  const handleSubmitSignUP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (nickName === "") return;
    const data = Cookies.get("accessToken");
    if (data) {
      const token = JSON.parse(data);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // 꼭 첨부해야함!
        },
        body: JSON.stringify({
          id: user42Dto?.id,
          nickname: nickName,
          enable2FA: false,
          data2FA: "what should i put here?",
        }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            res
              .text()
              .then((text) => JSON.parse(text).message)
              .then((msg) => {
                if (msg === "user already exists") {
                  router.push(`${errorPage}?error=user_already_exist`);
                } else if (msg === "duplicated nickname") {
                  setNickName("");
                }
              });
            throw new Error(`Custom Error: ${res.status} ${res.statusText}`);
          }
        })
        .then((data) => {
          Cookies.remove("user42Dto");
          if (localStorage.getItem("user")) localStorage.removeItem("user");
          // localStorage.setItem("user", JSON.stringify(user42Dto));
          if (user42Dto && nickName) {
            const user: UserInfo = {
              id: user42Dto.id,
              nickname: nickName,
              user42Dto: user42Dto,
            };
            localStorage.setItem("user", JSON.stringify(user));
            router.push("http://localhost:3001/menu");
          } else {
            router.push(`${errorPage}?error=no_user42Dto_or_no_nickname`);
          }
        })
        .catch((err) => console.log("FAILED " + err));
    }
  };

  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Window title="Sign in Page" w="300" h="480">
        <div className="flex flex-col space-y-3 m-3 items-right">
          {/* User Info Block */}
          <InfoBlock user42Dto={user42Dto} setUser42Dto={setUser42Dto} />
          {/* Nickname Block */}
          <NickNameBlock nickName={nickName} setNickName={setNickName} />
          {/* Avatar Block */}
          {user42Dto ? <AvatarBlock user42Dto={user42Dto} /> : null}
          <br />
          {/* Sign - Up Form*/}
          <form onSubmit={handleSubmitSignUP} className="w-full">
            <div className=" text-center">
              <Button>Sign - up</Button>
            </div>
          </form>
        </div>
      </Window>
    </div>
  );
};

export default SignUpPage;

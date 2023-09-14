import { Button, Input, Frame } from "@react95/core";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import Window from "@/components/common/Window";
import InfoBlock from "@/components/signup/InfoBlock";
import AvatarBlock from "@/components/signup/AvatarBlock";
import NickNameBlock from "@/components/signup/NickNameBlock";
// import { User42Dto } from "@/types/User42Dto"; // have to delete that file
import type { UserInfo } from "@/types/UserInfo";
import type { SignupDto, User42Dto } from "@/types/SignUpType";

const SignUpPage = () => {
  const router = useRouter();
  const [nickName, setNickName] = useState<string | null>(null);
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);
  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const menuUrl = frontendUrl + "/menu";

  useEffect(() => {
    const cookie_data = Cookies.get("accessToken");
    const cookie_user = Cookies.get("user42Dto");
    if (cookie_data) {
      sessionStorage.setItem("accessToken", cookie_data);
      Cookies.remove("accessToken");
    } else router.push(`${errorPage}?error=failed_get_access_token_cookie`);
    if (cookie_user) {
      const user = JSON.parse(cookie_user);
      Cookies.remove("user42Dto");
      setUser42Dto(user);
    } else goToMenuPage();
  }, []);

  const goToMenuPage = () => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logon`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, },
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Unkwon Error : ");
      })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
        if (frontendUrl)
          router.push(frontendUrl);
      });
    router.push(menuUrl);
  };

  // send SignUpDto to backend
  const handleSubmitSignUP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nickName || nickName === "") return;
    const token = sessionStorage.getItem("accessToken");
    if (!token)
      return router.push(`${errorPage}?error=failed_get_access_token_cookie`);
    if (!user42Dto) return router.push(`${errorPage}?error=no_user42Dto`);
    const sendData: SignupDto = {
      id: user42Dto.id,
      nickname: nickName,
      enable2FA: false,
      data2FA: "what should i put here?",
    };
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/signup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendData),
    })
      .then((res) => {
        if (res.ok) {
          if (user42Dto && nickName) {
            goToMenuPage();
          } else router.push(`${errorPage}?error=no_user42Dto_or_no_nickname`);
        } else {
          res
            .text()
            .then((text) => JSON.parse(text).message)
            .then((msg) => {
              if (msg === "user already exists")
                router.push(`${errorPage}?error=user_already_exist`);
              else if (msg === "duplicated nickname") setNickName("");
              else throw new Error(`unknown: ${res.status} ${res.statusText}`);
            });
        }
      })
      .catch((err) => {
        console.log("Error: " + err);
        router.push(`${errorPage}?error=unknown_error`);
      });
  };

  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Window title="Sign in Page" w="300" h="480" xOption={false}>
        {!user42Dto ? (
          <div className=" text-2xl text-center pt-60">Loading...</div>
        ) : (
          <div className="flex flex-col space-y-3 m-3 items-right">
            {/* User Info Block */}
            <InfoBlock user42Dto={user42Dto} />
            {/* Nickname Block */}
            <NickNameBlock nickName={nickName} setNickName={setNickName} />
            {/* Avatar Block */}
            <AvatarBlock user42Dto={user42Dto} />
            {/* 2FA Block 
              checkbox + input
            */}
            <br />
            {/* Sign - Up Form*/}
            <form onSubmit={handleSubmitSignUP} className="w-full">
              <div className=" text-center">
                <Button>Sign - up</Button>
              </div>
            </form>
          </div>
        )}
      </Window>
    </div>
  );
};

export default SignUpPage;

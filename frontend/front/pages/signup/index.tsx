// Libraries
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@react95/core";
import Cookies from "js-cookie";
// Components
import sendAvatar from "@/components/func/sendAvatar";
import Window from "@/components/common/Window";
import InfoBlock from "@/components/signup/InfoBlock";
import AvatarBlock from "@/components/signup/AvatarBlock";
import NickNameBlock from "@/components/signup/NickNameBlock";
import TwoFABlock from "@/components/signup/TwoFABlock";
import TwoFactorAuthentication from "@/components/signup/TwoFactorAuthentication";
// Types
import type { SignupDto, User42Dto } from "@/types/SignUpType";

const SignUpPage = () => {
  const router = useRouter();
  const [nickName, setNickName] = useState<string | null>(null);
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [uploadAvatar, setUploadAvatar] = useState<File | null>(null);

  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const menuUrl = frontendUrl + "/menu";

  const [twoFAEmail, setTwoFAEmail] = useState<string | undefined>(undefined);
  const [twoFAEmailValid, setTwoFAEmailValid] = useState<boolean>(false);
  const [twoFactorPage, setTwoFactorPage] = useState<boolean>(false);

  const [signupErrorStr, setSignupErrorStr] = useState<string>("");
  const [cookieTwoFA, setCookieTwoFA] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Init Data & Route Page
    const cookie_data = Cookies.get("accessToken");
    const cookie_user = Cookies.get("user42Dto");
    const cookie_twoFA = Cookies.get("twoFA");
    setCookieTwoFA(cookie_twoFA);
    Cookies.remove("accessToken");
    Cookies.remove("user42Dto");
    Cookies.remove("twoFA");
    if (cookie_data) {
      sessionStorage.setItem("accessToken", cookie_data);
    } else router.push(`${errorPage}?error=failed_get_access_token_cookie`);
    if (cookie_user) {
      const user = JSON.parse(cookie_user);
      setUser42Dto(user);
    } else if (cookie_twoFA) {
      setTwoFactorPage(true); // & => 2FA page
    } else logonAndGoMenuPage();
  }, []);

  // Sign-up
  const handleSubmitSignUP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    if (!token)
      return router.push(`${errorPage}?error=failed_get_access_token_cookie`);
    if (!user42Dto) return router.push(`${errorPage}?error=no_user42Dto`);
    if (!nickName || nickName === "")
      return setSignupErrorStr("닉네임을 입력해 주세요");
    if (isTwoFAChecked() && !twoFAEmailValid)
      return setSignupErrorStr("유효한 이메일을 먼저 등록해 주세요");
    const sendData: SignupDto = {
      id: user42Dto.id,
      nickname: nickName,
      enable2FA: isTwoFAChecked(),
      data2FA: isTwoFAChecked() ? twoFAEmail : undefined,
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
            sendAvatar({ setAvatarURL, uploadAvatar });
            logonAndGoMenuPage();
          } else router.push(`${errorPage}?error=no_user42Dto_or_no_nickname`);
        } else {
          res.text().then((msg) => {
            if (msg === "user already exists")
              router.push(`${errorPage}?error=user_already_exist`);
            else if (msg === "duplicated nickname")
              setSignupErrorStr("중복된 닉네임 입니다");
            else throw new Error(`unknown: ${res.status} ${res.statusText}`);
          });
        }
      })
      .catch((err) => {
        console.log("Error: " + err);
        router.push(`${errorPage}?error=unknown_error`);
      });
  };

  // Utils
  const isTwoFAChecked = () => {
    return twoFAEmail !== undefined;
  };

  const logonAndGoMenuPage = () => {
    // logon 신청
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logon`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Unkwon Error : ");
      })
      .then((data) => {
        sessionStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
        if (frontendUrl) router.push(frontendUrl);
      });
    router.push(menuUrl);
  };

  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Window title="Sign in Page" w="300" h="550" xOption={false}>
        {!twoFactorPage && user42Dto ? (
          <div className="flex flex-col space-y-3 m-3 items-right">
            <InfoBlock user42Dto={user42Dto} />
            <NickNameBlock nickName={nickName} setNickName={setNickName} />
            <AvatarBlock
              avatarURL={avatarURL}
              setAvatarURL={setAvatarURL}
              setUploadAvatar={setUploadAvatar}
            />
            <TwoFABlock
              setTwoFAEmail={setTwoFAEmail}
              twoFAEmailValid={twoFAEmailValid}
              setTwoFAEmailValid={setTwoFAEmailValid}
            />
            {/* Sign-up Button */}
            <form onSubmit={handleSubmitSignUP} className="w-full">
              <div className=" text-center">
                <Button>Sign - up</Button>
              </div>
              <div className="px-5 text-red-700 font-bold">
                {signupErrorStr}
              </div>
            </form>
          </div>
        ) : twoFactorPage && cookieTwoFA ? (
          <TwoFactorAuthentication
            email={cookieTwoFA}
            logonAndGoMenuPage={logonAndGoMenuPage}
          />
        ) : (
          <div className=" text-2xl text-center pt-60">Loading...</div>
        )}
      </Window>
    </div>
  );
};

export default SignUpPage;

// 나중에 refactor 사항
// fetch 안에 fetch 밖으로 꺼내서 분리 (Error 처리변수 생성)
// twoFA 입력사항 블록 컴포넌트화

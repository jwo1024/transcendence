import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Button, Input, Frame } from "@react95/core";
import Cookies from "js-cookie";

import Window from "@/components/common/Window";
import InfoBlock from "@/components/signup/InfoBlock";
import AvatarBlock from "@/components/signup/AvatarBlock";
import NickNameBlock from "@/components/signup/NickNameBlock";
import CheckBox from "@/components/common/CheckBox";
import sendAvatar from "@/components/common/sendAvatar";
// import { User42Dto } from "@/types/User42Dto"; // have to delete that file
import type { UserInfo } from "@/types/UserInfo";
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
  const [twoFAchecked, setTwoFAchecked] = useState<boolean>(false);
  const twoFARef = useRef<HTMLInputElement>();

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
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Unkwon Error : ");
      })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
        if (frontendUrl) router.push(frontendUrl);
      });
    router.push(menuUrl);
  };

  // send SignUpDto to backend
  const handleSubmitSignUP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // tmp get twoFA email valuel
    const twoFAemail = twoFARef.current?.value;
    if (twoFAchecked && (!twoFAemail || twoFAemail === "")) return;
    // 마음에 들지 않는 구조이지만 일딴 이렇게 하죠
    // 왜 마음에 안들어요
    if (!nickName || nickName === "") return;
    const token = sessionStorage.getItem("accessToken");
    if (!token)
      return router.push(`${errorPage}?error=failed_get_access_token_cookie`);
    if (!user42Dto) return router.push(`${errorPage}?error=no_user42Dto`);
    const sendData: SignupDto = {
      id: user42Dto.id,
      nickname: nickName,
      enable2FA: twoFAchecked,
      data2FA: twoFAemail || undefined,
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
            sendAvatar();
            goToMenuPage();
          } else router.push(`${errorPage}?error=no_user42Dto_or_no_nickname`);
        } else {
          res
            .text()
            .then((text) => JSON.parse(text).message)
            .then((msg) => {
              if (msg === "user already exists")
                router.push(`${errorPage}?error=user_already_exist`);
              else if (msg === "invalid 2FA") setNickName("");
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
  // 나중에 refactor 사항
  // fetch 안에 fetch 밖으로 꺼내서 분리 (Error 처리변수 생성)
  // twoFA 입력사항 블록 컴포넌트화

  const sendAvatar = () => {
    const formData = new FormData();
    formData.append("image", uploadAvatar as Blob); // 필드 이름을 'image'로 변경
    //  formData.append("ext", `.${uploadAvatar?.name?.split(".").pop()}`);
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
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

  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Window title="Sign in Page" w="300" h="550" xOption={false}>
        {!user42Dto ? (
          <div className=" text-2xl text-center pt-60">Loading...</div>
        ) : (
          <div className="flex flex-col space-y-3 m-3 items-right">
            {/* User Info Block */}
            <InfoBlock user42Dto={user42Dto} />
            {/* Nickname Block */}
            <NickNameBlock nickName={nickName} setNickName={setNickName} />
            {/* Avatar Block */}
            <AvatarBlock
              avatarURL={avatarURL}
              setAvatarURL={setAvatarURL}
              setUploadAvatar={setUploadAvatar}
            />
            {/* 2FA Block 
              checkbox + input
            */}
            <CheckBox
              label="2FA Enable (이중 인증 활성화)"
              checked={twoFAchecked}
              setChecked={setTwoFAchecked}
            />
            {twoFAchecked ? (
              <>
                <div>유효한 이메일을 입력해 주세요</div>
                <Input
                  placeholder=" ex) jchoi@student.42seoul.kr"
                  ref={twoFARef}
                />
              </>
            ) : null}
            {/* <br /> */}
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

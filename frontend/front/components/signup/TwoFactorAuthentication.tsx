import { Fieldset, Button, Input } from "@react95/core";
import { useEffect, useRef, useState } from "react";

interface NickNameBlockProps {
  email: string;
  logonAndGoMenuPage: () => void;
}

const TwoFactorAuthentication = ({
  email,
  logonAndGoMenuPage,
}: NickNameBlockProps) => {
  const textFromEmail = useRef<HTMLInputElement>();
  // 0 = 미인증, 1 = 실패, 2 = 성공
  const [success, setSuccess] = useState<number>(0);
  const [notifyStr, setNotifyStr] = useState<string>("");
  const [twoFAEmailValid, setTwoFAEmailValid] = useState<boolean>(false);

  const [issuedAt, setIssuedAt] = useState<Date | null>(null); // at
  const [intervalState, setIntervalState] = useState<NodeJS.Timeout | null>(
    null
  );
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    return () => {
      if (intervalState) clearInterval(intervalState);
    };
  }, []);

  useEffect(() => {
    if (issuedAt) {
      if (intervalState) clearInterval(intervalState);
      const intervalId = setInterval(() => {
        setTimeStr(timer());
      }, 500);
      setIntervalState(intervalId);
    }
  }, [issuedAt]);

  const timer = (): string => {
    if (issuedAt) {
      const time = new Date(issuedAt);
      const now = new Date();
      const diff = now.getTime() - time.getTime();
      const remainingTime = 5 * 60 * 1000 - diff;
      if (remainingTime <= 0) return "expired";
      const min = Math.floor(remainingTime / 60000);
      const sec = Math.floor((remainingTime - min * 60000) / 1000);
      return `${min} : ${sec}`;
    }
    return "";
  };

  const sendingMailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tfa/send`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((res) => {
        setNotifyStr("");
        if (res.status === 409) {
          setSuccess(1);
          setTwoFAEmailValid(false);
          setNotifyStr(
            "메일 전송에 실패했습니다. 다시 시도하거나 다른 이메일을 입력해 주세요"
          );
        } else if (res.ok) {
          res.text().then((otp) => {
            const otpIssuedAt: Date = JSON.parse(otp).issuedAt;
            setIssuedAt(otpIssuedAt);
          });
          return "";
        } else return "unknown error";
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const validationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tfa/verify`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: textFromEmail.current?.value }),
    })
      .then((res) => {
        if (res.ok) {
          setNotifyStr("");
          setSuccess(2);
          setNotifyStr("인증에 성공하였습니다.");
          setTwoFAEmailValid(true); // 등록 성공을 알려야 함
        } else {
          setSuccess(1);
          setNotifyStr("인증에 실패하였습니다.");
          setTwoFAEmailValid(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col w-full h-full items-center px-5 py-6 justify-between">
      <div className="flex flex-col items-center w-full space-y-10">
        <form
          onSubmit={sendingMailSubmit}
          className="flex flex-col items-center space-y-4 w-full"
        >
          <Fieldset legend="My email" className="p-2 w-full">
            <span className="text-xl">{email}</span>
          </Fieldset>
          <Button className="w-full">인증 메일 발송</Button>
          <div className="text-center text-xl ">
            {(timeStr ? "[validity duration] " : " ") + timeStr}
          </div>{" "}
        </form>
        <form
          onSubmit={validationSubmit}
          className="flex flex-col space-y-4 p-0.5 items-center w-full"
        >
          <Input
            placeholder="이메일로 받은 text"
            ref={textFromEmail}
            className="flex-1 w-full"
          />
          <Button className="w-full">제출</Button>
        </form>
        {success === 1 ? (
          <span className=" text-red-600 text-lg">{notifyStr}</span>
        ) : success === 2 ? (
          <span className=" text-blue-600 text-lg">{notifyStr}</span>
        ) : null}
      </div>
      <Button
        onClick={logonAndGoMenuPage}
        className="w-full"
        disabled={!twoFAEmailValid}
      >
        Menu로 가기
      </Button>
    </div>
  );
};

export default TwoFactorAuthentication;

// Libraries
import { useEffect, useState, useRef } from "react";
import { Button, Input } from "@react95/core";
import { isEmail } from "class-validator";
// Components
import CheckBox from "@/components/common/CheckBox";

interface TwoFABlockProps {
  setTwoFAEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  twoFAEmailValid: boolean;
  setTwoFAEmailValid: React.Dispatch<React.SetStateAction<boolean>>;
}
const TwoFABlock = ({
  setTwoFAEmail,
  twoFAEmailValid,
  setTwoFAEmailValid,
}: TwoFABlockProps) => {
  const twoFAEmailRef = useRef<HTMLInputElement>();
  const twoFATextRef = useRef<HTMLInputElement>();
  const [twoFAchecked, setTwoFAchecked] = useState<boolean>(false);
  const [twoFAtextChecked, setTwoFAtextChecked] = useState<boolean>(false);
  const [notifyStr, setNotifyStr] = useState<string>("");

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
    if (twoFAchecked) {
      setTwoFAEmail("");
      twoFAEmailRef.current?.focus();
    } else setTwoFAEmail(undefined);
  }, [twoFAchecked]);

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

  // 등록
  const onSubmitTwoFAEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFAEmail(() => {
      console.log("twoFAEmailRef.current?.value", twoFAEmailRef.current?.value);
      const emailRef = twoFAEmailRef.current?.value;
      if (emailRef) {
        sendEmailCheck(emailRef);
        return emailRef;
      }
      if (emailRef === "" || !isEmail(emailRef))
        return "유효한 형식의 이메일을 입력해 주세요";
    });
  };

  const sendEmailCheck = (emailRef: string) => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tfa/send`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailRef }),
    })
      .then((res) => {
        setNotifyStr(() => {
          if (res.status === 409)
            return "메일 전송에 실패했습니다. 다시 시도하거나 다른 이메일을 입력해 주세요";
          else if (res.ok) {
            setTwoFAtextChecked(true);
            res.text().then((otp) => {
              const otpIssuedAt: Date = JSON.parse(otp).issuedAt;
              setIssuedAt(otpIssuedAt);
            });
            return "";
          } else return "unknown error";
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmitTwoFAValidate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tfa/verify`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: twoFATextRef.current?.value }),
    })
      .then((res) => {
        if (res.ok) {
          setNotifyStr("");
          setTwoFAEmailValid(true); // 등록 성공을 알려야 함
          setNotifyStr("등록 완료!");
        } else {
          setNotifyStr("인증에 실패했습니다. 다시 시도해 주세요");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <CheckBox
        label="2FA Enable (이중 인증 활성화)"
        checked={twoFAchecked}
        setChecked={setTwoFAchecked}
      />
      {twoFAchecked ? (
        <>
          <form className="flex" onSubmit={onSubmitTwoFAEmail}>
            <Input
              className="flex-1 "
              placeholder=" ex) jchoi@student.42seoul.kr"
              ref={twoFAEmailRef}
            />
            <Button>등록 및 OTP 전송</Button>
          </form>
          {twoFAtextChecked ? (
            <div className="flex flex-col">
              <form className="flex" onSubmit={onSubmitTwoFAValidate}>
                <Input
                  className="flex-1 "
                  placeholder=" 해당 이메일로 발송된 인증문자를 입력해 주세요"
                  ref={twoFATextRef}
                />
                <Button>제출</Button>
              </form>
              <div className="text-right text-xl ">{timeStr}</div>{" "}
            </div>
          ) : null}
          {twoFAEmailValid ? (
            <div className="px-5 text-green-700 font-bold">{notifyStr}</div>
          ) : (
            <div className="px-5 text-red-700 font-bold">{notifyStr}</div>
          )}
        </>
      ) : null}
    </>
  );
};

export default TwoFABlock;

// Libraries
import { useEffect, useState, useRef } from "react";
import { Button, Input } from "@react95/core";
import { isEmail } from "class-validator";
// Components
import CheckBox from "@/components/common/CheckBox";

interface TwoFABlockProps {
  twoFAEmail: string | undefined;
  setTwoFAEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  twoFAEmailValid: boolean;
  setTwoFAEmailValid: React.Dispatch<React.SetStateAction<boolean>>;
}
const TwoFABlock = ({
  twoFAEmail,
  setTwoFAEmail,
  twoFAEmailValid,
  setTwoFAEmailValid,
}: TwoFABlockProps) => {
  const twoFAEmailRef = useRef<HTMLInputElement>();
  const twoFATextRef = useRef<HTMLInputElement>();
  const [twoFAchecked, setTwoFAchecked] = useState<boolean>(false);
  const [twoFAtextChecked, setTwoFAtextChecked] = useState<boolean>(false);
  const [notifyStr, setNotifyStr] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (twoFAchecked) {
      setTwoFAEmail("");
      twoFAEmailRef.current?.focus();
    } else setTwoFAEmail(undefined);
  }, [twoFAchecked]);

  // 등록
  const onSubmitTwoFAEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFAEmail(twoFAEmailRef.current?.value || "");
    if (twoFAEmail === "" || !isEmail(twoFAEmail))
      return setNotifyStr("유효한 형식의 이메일을 입력해 주세요");
    const token = sessionStorage.getItem("accessToken");
    fetch("http://localhost:4000/tfa/send", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: twoFAEmail }),
    }).then((res) => {
      if (res.ok) {
        setNotifyStr("");
        setTwoFAtextChecked(true);
        res.text().then((issuedAt) => {
          console.log(JSON.parse(issuedAt));
          setElapsedTime(JSON.parse(issuedAt));
        });
      } else {
        setNotifyStr(
          "메일 전송에 실패했습니다. 다시 시도하거나 다른 이메일을 입력해 주세요"
        );
      }
    });
  };

  const onSubmitTwoFAValidate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    fetch("http://localhost:4000/tfa/verify", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: twoFATextRef.current?.value }),
    }).then((res) => {
      if (res.ok) {
        setNotifyStr("");
        setTwoFAEmailValid(true); // 등록 성공을 알려야 함
        setNotifyStr("등록 완료!");
      } else {
        setNotifyStr("인증에 실패했습니다. 다시 시도해 주세요");
      }
    });
  };

  const timer = () => {
    if (elapsedTime) {
      const now = new Date();
      const diff = now.getTime() - elapsedTime.getTime();
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff - min * 60000) / 1000);
      return `${min}분 ${sec}초`;
    }
    return "";
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
            <Button>등록</Button>
          </form>
          {twoFAtextChecked ? (
            <form className="flex" onSubmit={onSubmitTwoFAValidate}>
              <Input
                className="flex-1 "
                placeholder=" 해당 이메일로 발송된 인증문자를 입력해 주세요"
                ref={twoFATextRef}
              />
              <Button>문자열확인</Button>
            </form>
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

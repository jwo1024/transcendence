// Libraries
import { useEffect, useState, useRef } from "react";
import { Button, Input } from "@react95/core";
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
  const twoFAVaildRef = useRef<HTMLInputElement>();
  const [twoFAchecked, setTwoFAchecked] = useState<boolean>(false);
  const [errorStr, setErrorStr] = useState<string>("");

  useEffect(() => {
    if (twoFAchecked) {
      setTwoFAEmail("");
      twoFAEmailRef.current?.focus();
    } else setTwoFAEmail(undefined);
  }, [twoFAchecked]);

  const onSubmitTwoFAEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFAEmailValid(true);
    setTwoFAEmail(twoFAEmailRef.current?.value || "");
    if (twoFAchecked && (!twoFAEmail || twoFAEmail === "")) return;
    if (twoFAEmail === "") return;

    if (0) setErrorStr("유효하지 않은 이메일 입니다");
    else setErrorStr("");
  };

  const onSubmitTwoFAValidate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          {twoFAEmailValid ? (
            <form className="flex" onSubmit={onSubmitTwoFAValidate}>
              <Input
                className="flex-1 "
                placeholder=" 해당 이메일로 발송된 인증문자를 입력해 주세요"
                ref={twoFAVaildRef}
              />
              <Button>문자열확인</Button>
            </form>
          ) : null}
          <div className="px-5 text-red-700 font-bold">{errorStr}</div>
        </>
      ) : null}
    </>
  );
};

export default TwoFABlock;

import { Fieldset, Button, Input } from "@react95/core";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

interface NickNameBlockProps {
  email: string;
}

const TwoFactorAuthentication = ({ email }: NickNameBlockProps) => {
  const router = useRouter();
  const textFromEmail = useRef<HTMLInputElement>();
  // 0 = 미인증, 1 = 실패, 2 = 성공
  const [success, setSuccess] = useState<number>(0);

  const sendingMailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  const validationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 인증 성공이라면
    // setSuccess(2);
    /// 인증 실패라면
    // setSuccess(1);
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
          <Button className="w-full">제출하기</Button>
        </form>
        {success === 1 ? (
          <span className=" text-red-600 text-lg">인증에 실패하였습니다.</span>
        ) : success === 2 ? (
          <span className=" text-blue-600 text-lg">인증에 성공하였습니다.</span>
        ) : null}
      </div>
      <Button
        onClick={() => {
          router.push("/menu");
        }}
        className="w-full"
      >
        Menu로 가기
      </Button>
    </div>
  );
};

export default TwoFactorAuthentication;

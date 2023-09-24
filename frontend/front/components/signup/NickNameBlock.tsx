import { Input } from "@react95/core";
import { useRef } from "react";

interface NickNameBlockProps {
  nickName: string | null;
  setNickName: React.Dispatch<React.SetStateAction<string | null>>;
}

const NickNameBlock = ({ nickName, setNickName }: NickNameBlockProps) => {
  const nickNameInputRef = useRef<HTMLInputElement>();
  const handleBlurInput = () => {
    setNickName(nickNameInputRef.current?.value || "");
  };

  return (
    <>
      <label>👻 유저 닉네임을 설정해 주세요 👀</label>
      <div className="flex flex-row space-y-1 p-0.5 items-center">
        <Input
          placeholder="Nick Name"
          ref={nickNameInputRef}
          className="flex-1 "
          onBlur={handleBlurInput}
        />
      </div>
      {nickName === "" ? (
        <div className="px-5 text-red-700 font-bold">
          유효하지 않은 닉네임 입니다
        </div>
      ) : null}
    </>
  );
};

export default NickNameBlock;

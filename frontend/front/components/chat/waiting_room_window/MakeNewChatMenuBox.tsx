import { useContext, useRef, useState } from "react";
import { Fieldset, Input, Button, Checkbox } from "@react95/core";
import SelectButton from "@/components/common/SelectButton";
import type { FrameButtonProps } from "@/components/common/SelectButton";
import MenuBoxLayout from "../common/MenuBoxLayout";
import { SocketContext } from "@/context/ChatSocketContext";
import CheckBox from "@/components/common/CheckBox";
import type { RoomCreateDTO } from "@/types/ChatInfoType";

const MakeNewChatMenu = () => {
  const socket = useContext(SocketContext);
  const titleRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>(); // 암호화필요
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordChecked, setPasswordChecked] = useState<boolean>(false);
  const [isPublicRoom, setIsPublicRoom] = useState<boolean | null>(null);

  const frameElement: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => setIsPublicRoom(true) },
    { children: "초대방", handleClickCustom: () => setIsPublicRoom(false) },
  ];

  // TODO : with : surlee : open, private, protected, dm 방 구분하기 => 비밀번호 & protected 있을 수 있음
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // reload 방지
    const title = titleRef.current?.value;
    const password = passwordRef.current?.value;
    if (!title || title === "") setErrorMsg("방제를 입력해주세요");
    else if (passwordChecked && password === "")
      setErrorMsg("비밀번호를 입력해주세요");
    else if (isPublicRoom === null) setErrorMsg("방 타입을 선택해주세요");
    else {
      const newRoom: RoomCreateDTO = {
        roomName: title,
        roomType: isPublicRoom ? "open" : "private",
        roomPass: passwordChecked ? password : undefined,
      };
      if (socket) socket?.emit("Room-create", newRoom);
    }
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 w-full h-min"
        legend="New Chat Room"
      >
        {/*  방제목 입력 */}
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <Input placeholder="방제 입력" ref={titleRef} />
          {/* <Checkbox label="비밀번호 설정" checked={true} /> */}
          <CheckBox
            label="비밀번호"
            checked={passwordChecked}
            setChecked={setPasswordChecked}
          />
          {passwordChecked ? (
            <Input placeholder="비밀번호 입력" ref={passwordRef} />
          ) : null}
          <br />
          <SelectButton frameButton={frameElement} />
          <br />
          <Button className=" font-semibold">방 만들기</Button>
          <span className=" mt-2 text-red-700"> {errorMsg}</span>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default MakeNewChatMenu;

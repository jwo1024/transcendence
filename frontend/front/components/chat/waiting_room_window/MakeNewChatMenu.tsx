// Libraries
import { useContext, useRef, useState, useEffect } from "react";
import { Fieldset, Input, Button } from "@react95/core";
// Components
import SelectButton from "@/components/common/SelectButton";
import type { FrameButtonProps } from "@/components/common/SelectButton";
import MenuBoxLayout from "../common/MenuBoxLayout";
import { SocketContext } from "@/context/ChatSocketContext";
import CheckBox from "@/components/common/CheckBox";
// Types & Hooks & Contexts
import type { RoomCreateDTO, ResponseDTO } from "@/types/ChatInfoType";
import {
  EMIT_ROOM_CREATE,
  ON_RESPONSE_ROOM_CREATE,
} from "@/types/ChatSocketEventName";

const MakeNewChatMenu = () => {
  const socket = useContext(SocketContext);
  const titleRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordChecked, setPasswordChecked] = useState<boolean>(false);
  const [isPublicRoom, setIsPublicRoom] = useState<boolean>(true);

  const frameElement: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => setIsPublicRoom(true) },
    { children: "초대방", handleClickCustom: () => setIsPublicRoom(false) },
  ];

  useEffect(() => {
    if (titleRef.current) titleRef.current.focus();
    return () => {
      socket?.off(ON_RESPONSE_ROOM_CREATE);
    };
  }, []);

  useEffect(() => {
    if (isPublicRoom) setPasswordChecked(false);
  }, [isPublicRoom]);

  useEffect(() => {
    if (passwordChecked) passwordRef.current?.focus();
  }, [passwordChecked]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      console.log("socket.emit EMIT_ROOM_CREATE", newRoom);
      socket?.emit(EMIT_ROOM_CREATE, newRoom);
      socket?.once(ON_RESPONSE_ROOM_CREATE, (data) => {
        const res: ResponseDTO = data;
        console.log("socket.on ON_RESPONSE_ROOM_CREATE", data);
        if (!res.success)
          setErrorMsg(`채팅방 만들기에 실패했습니다 : ${res.message}`);
        else setErrorMsg(null);
      });
    }
    if (titleRef.current?.value === undefined) return;
    titleRef.current.value = "";
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

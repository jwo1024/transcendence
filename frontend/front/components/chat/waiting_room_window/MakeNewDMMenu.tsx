// Libraries
import { useContext, useRef, useState, useEffect } from "react";
import { Fieldset, Input, Button } from "@react95/core";
// Components
import MenuBoxLayout from "../common/MenuBoxLayout";
// Types & Hooks & Contexts
import { SocketContext } from "@/context/ChatSocketContext";
import type {
  RoomCreateDTO,
  SimpUserI,
  ResponseDTO,
} from "@/types/ChatInfoType";
import {
  EMIT_DM_CREATE,
  ON_RESPONSE_DM_CREATE,
} from "@/types/ChatSocketEventName";

interface MakeNewChatMenuBoxProps {
  userInfo: SimpUserI;
}
const MakeNewDMMenu = ({ userInfo }: MakeNewChatMenuBoxProps) => {
  const socket = useContext(SocketContext);
  const friendNickRef = useRef<HTMLInputElement>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (friendNickRef.current) friendNickRef.current.focus();
    return () => {
      socket?.off(ON_RESPONSE_DM_CREATE);
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!friendNickRef || friendNickRef.current?.value === "") {
      setErrorMsg("친구 닉네임을 입력해주세요");
      return;
    }
    const friendNick = friendNickRef.current?.value;
    const title = `[${userInfo.nickname} & ${friendNick}]`;
    const newRoom: RoomCreateDTO = {
      roomName: title,
      roomType: "dm",
      roomPass: undefined,
    };
    console.log("socket.emit EMIT_DM_CREATE", newRoom, friendNick || "");
    socket?.once(ON_RESPONSE_DM_CREATE, (data) => {
      const res: ResponseDTO = data;
      console.log("socket.on ON_RESPONSE_DM_CREATE", data);
      if (!res.success)
        setErrorMsg(`DM방 만들기에 실패했습니다 : ${res.message}`);
      else setErrorMsg(null);
    });
    socket?.emit(EMIT_DM_CREATE, { room: newRoom, userNickname: friendNick });
    if (friendNickRef.current?.value === undefined) return;
    friendNickRef.current.value = "";
  };

  return (
    <MenuBoxLayout>
      <Fieldset className="flex flex-col p-2 w-full h-min" legend="DM User">
        {/* 친구 닉네임 입력 */}
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <Input placeholder="DM 친구찾기" ref={friendNickRef} />
          <br />
          <Button className=" font-semibold">DM방 만들기</Button>
          <span className=" mt-2 text-red-700"> {errorMsg}</span>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default MakeNewDMMenu;

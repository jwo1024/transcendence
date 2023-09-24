// Libraries
import { useContext, useRef, useState } from "react";
import { Fieldset, Input, Button, Checkbox } from "@react95/core";
// Components
import MenuBoxLayout from "../common/MenuBoxLayout";
// Types & Hooks & Contexts
import { SocketContext } from "@/context/ChatSocketContext";
import type { RoomCreateDTO, SimpUserI } from "@/types/ChatInfoType";

interface MakeNewChatMenuBoxProps {
  userInfo: SimpUserI;
}

const MakeNewDMBOX = ({ userInfo }: MakeNewChatMenuBoxProps) => {
  const socket = useContext(SocketContext);
  const friendNickRef = useRef<HTMLInputElement>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // reload 방지
    if (!friendNickRef || friendNickRef.current?.value === "") {
      setErrorMsg("친구 닉네임을 입력해주세요");
      return;
    }
    const friendNick = friendNickRef.current?.value;
    const title = `DM / ${userInfo.nickname} & ${friendNick}]`;
    const newRoom: RoomCreateDTO = {
      roomName: title,
      roomType: "dm",
      roomPass: undefined,
    };
    if (socket) socket?.emit("Room-create", newRoom, friendNick);
    // 만약 없는 친구 이름이라면은...? // 방만들기에 실패했다면은 ?
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

export default MakeNewDMBOX;

// Libraries
import { Fieldset, Button } from "@react95/core";
import React, { useContext } from "react";
// Components
import MenuBoxLayout from "@/components/chat/common/MenuBoxLayout";
import { SocketContext } from "@/context/ChatSocketContext";
// Types & Hooks & Contexts
import { SimpRoomI } from "@/types/ChatInfoType";
import {
  EMIT_ROOM_LEAVE,
  ON_RESPONSE_ROOM_LEAVE,
} from "@/types/ChatSocketEventName";

interface LeaveRoomMenuBoxProps {
  roomInfo: SimpRoomI;
  triggerClose?: () => void;
}

// LeaveRoomMenuBox
const LeaveRoomMenuBox = ({
  roomInfo,
  triggerClose,
}: LeaveRoomMenuBoxProps) => {
  const socket = useContext(SocketContext);

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("정말, 정말로 채팅방을 떠나시겠습니까?")) return;
    // TODO
    socket?.emit(EMIT_ROOM_LEAVE, roomInfo.roomId);
    socket?.on(ON_RESPONSE_ROOM_LEAVE, (data) => {
      console.log("socket.on leave-room", data);
    });
    triggerClose && triggerClose();
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="Chat-Room Settings"
      >
        <form onSubmit={onSubmitForm}>
          <span>정말 떠나시겠다면 </span>
          <br />
          <span>아래의 버튼을 누르세요~</span>
          <br />
          <Button className=" font-semibold w-full">채팅방 떠나기</Button>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default LeaveRoomMenuBox;

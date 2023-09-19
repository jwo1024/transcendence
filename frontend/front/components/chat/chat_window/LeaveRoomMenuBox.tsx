import { Fieldset, Checkbox, Input, Button } from "@react95/core";
import SelectButton from "../../common/SelectButton";
import type { FrameButtonProps } from "../../common/SelectButton";
import React, { useState, useContext, useRef } from "react";
import MenuBoxLayout from "../common/MenuBoxLayout";
import { SocketContext } from "@/context/ChatSocketContext";
import { RoomCreateDTO, SimpRoomI, roomType } from "@/types/ChatInfoType";

interface LeaveRoomMenuBoxProps {
  roomInfo: SimpRoomI;
}

// LeaveRoomMenuBox
const LeaveRoomMenuBox = ({ roomInfo }: LeaveRoomMenuBoxProps) => {
  const socket = useContext(SocketContext);

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("Room-leave", roomInfo.roomId); // TODO : check
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="Chat-Room Settings"
      >
        <form onSubmit={onSubmitForm}>
          정말 떠나시겠다면 아래의 버튼을 누르세요~
          <br />
          <Button className=" font-semibold w-full">채팅방 떠나기</Button>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default LeaveRoomMenuBox;

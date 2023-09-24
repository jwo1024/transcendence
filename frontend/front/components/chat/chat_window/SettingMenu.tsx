// Libraries
import { Fieldset, Input, Button } from "@react95/core";
import React, { useState, useContext, useRef } from "react";
// Components
import CheckBox from "@/components/common/CheckBox";
import SelectButton from "../../common/SelectButton";
// Types & Hooks & Contexts
import type { FrameButtonProps } from "../../common/SelectButton";
import MenuBoxLayout from "../common/MenuBoxLayout";
import { SocketContext } from "@/context/ChatSocketContext";
import { RoomCreateDTO, SimpRoomI, roomType } from "@/types/ChatInfoType";

interface SettingMenuBoxProps {
  confirmButtonName?: string;
  roomInfo: SimpRoomI;
  isAdmin: boolean;
}

// SettingMenuBox
const SettingMenuBox = ({
  confirmButtonName,
  roomInfo,
  isAdmin,
}: SettingMenuBoxProps) => {
  const socket = useContext(SocketContext);
  const [checkedPassword, setCheckedPassword] = useState<boolean>(false);
  const passInputRef = useRef<HTMLInputElement>(null);
  const [roomType, setRoomType] = useState<roomType>(roomInfo.roomType);

  const handleCheckedPassword = () => {
    setCheckedPassword(!checkedPassword);
  };

  const frameButton: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => setRoomType("open") },
    { children: "비공개방", handleClickCustom: () => setRoomType("private") },
  ];

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roomData: RoomCreateDTO = {
      roomName: roomInfo.roomName,
      roomType: roomType,
      roomPass: checkedPassword ? passInputRef.current?.value : undefined,
    };
    // TODO
    // socket?.emit(EMIT_OWNER_ROOM_EDIT, roomData, roomInfo.roomId); // 이렇게 보내는게 맞나
    // console.log("Room-create : ", roomData, roomInfo.roomId);
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="Chat-Room Settings"
      >
        <form onSubmit={onSubmitForm}>
          <div className="flex flex-col mt-4">
            <div>공개/비공개 방</div>
            <SelectButton frameButton={frameButton} />
          </div>

          <div className="flex flex-col mt-4">
            <CheckBox
              label="비밀번호 설정"
              checked={checkedPassword}
              onChange={handleCheckedPassword}
            />
            {/* <input type="checkbox" id="scales" name="scales" checked /> */}
            {checkedPassword ? (
              <Input
                type="password"
                placeholder="비밀번호 입력"
                disabled={!checkedPassword}
                ref={passInputRef}
              />
            ) : null}
          </div>
          <br />
          <Button className=" font-semibold w-full" disabled={!isAdmin}>
            적용하기
          </Button>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default SettingMenuBox;

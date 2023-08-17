import React, { ReactNode } from "react";

import { Fieldset, Checkbox, Input, Button, Frame } from "@react95/core";
import SelectButton from "../common/SelectButton";

// TMP 이걸 어떻게 처리해야하나?
interface FrameButtonProps {
  children?: ReactNode;
  boxShadow?: "in" | "";
  handleClick?: () => void;
  handleClickCustom?: () => void;
}

// ChatSettingBox
const ChatSettingBox = ({ children }: { children?: ReactNode }) => {
  const frameButton: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => console.log("공개방 클릭") },
    { children: "비공개방" },
  ];

  return (
    <div className="flex flex-col w-2/5 p-3">
      <Fieldset
        className="flex flex-col p-2 w-full h-min gap-2 "
        legend="Chat-Room Settings"
      >
        {/* <div>관리자만 채팅방 설정이 가능합니다.</div> */}
        <div>공개/비공개 방</div>
        <SelectButton frameButton={frameButton} />

        <div className="flex flex-col mt-4 space-x-4">
          <Checkbox>비밀번호 설정</Checkbox>
          <Input placeholder="비밀번호 입력"></Input>
        </div>
        <br />
      </Fieldset>
    </div>
  );
};

export default ChatSettingBox;

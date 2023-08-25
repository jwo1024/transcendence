import { Fieldset, Checkbox, Input, Button } from "@react95/core";
import SelectButton from "../../common/SelectButton";
import type { FrameButtonProps } from "../../common/SelectButton";
import React, { useState } from "react";
import MenuBoxLayout from "../common/MenuBoxLayout";

interface ChatSettingBoxProps {
  confirmButtonName?: string;
}

// ChatSettingBox
const ChatSettingBox = ({ confirmButtonName }: ChatSettingBoxProps) => {
  const [checkedPassword, setCheckedPassword] = useState<boolean>(false);

  const handleCheckedPassword = () => {
    setCheckedPassword(!checkedPassword);
  };

  const frameButton: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => console.log("공개방 클릭") },
    { children: "비공개방" },
  ];

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="Chat-Room Settings"
      >
        <div className="flex flex-col mt-4">
          <div>공개/비공개 방</div>
          <SelectButton frameButton={frameButton} />
        </div>

        <div className="flex flex-col mt-4">
          <Checkbox checked={checkedPassword} onChange={handleCheckedPassword}>
            비밀번호 설정
          </Checkbox>
          {/* <input type="checkbox" id="scales" name="scales" checked /> */}
          {checkedPassword ? (
            <Input
              placeholder="비밀번호 입력"
              disabled={!checkedPassword}
            ></Input>
          ) : null}
        </div>

        <br />
        <Button className=" font-semibold">{confirmButtonName}</Button>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default ChatSettingBox;

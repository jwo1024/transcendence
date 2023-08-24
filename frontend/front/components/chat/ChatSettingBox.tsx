import React, { ReactNode } from "react";
import { Fieldset, Checkbox, Input, Button } from "@react95/core";
import SelectButton from "../common/SelectButton";

// TMP 이걸 어떻게 처리해야하나?
interface FrameButtonProps {
  children?: ReactNode;
  boxShadow?: "in" | "";
  handleClick?: () => void;
  handleClickCustom?: () => void;
}

// ChatSettingBox
const ChatSettingBox = () => {
  const [checkedPassword, setCheckedPassword] = React.useState<boolean>(false);

  const handleCheckedPassword = () => {
    setCheckedPassword(!checkedPassword);
  };

  const frameButton: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => console.log("공개방 클릭") },
    { children: "비공개방" },
  ];

  return (
    // <div className="flex flex-col w-2/5 p-3">
    <div>
      <Fieldset
        className="flex flex-col p-2 w-full h-min gap-2 "
        legend="Chat-Room Settings"
      >
        <div>관리자만 채팅방 설정이 가능합니다.</div>

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
        <Button className=" font-semibold">적용하기</Button>
      </Fieldset>
    </div>
  );
};

export default ChatSettingBox;

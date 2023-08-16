import React, { ReactNode } from "react";

import { Fieldset, Checkbox, Input } from "@react95/core";

const ChatSettingBox = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col w-2/5 p-3">
      <Fieldset
        className="flex flex-col p-2 w-full h-min"
        legend="Chat-Room Settings"
      >
        관리자만 채팅방 설정이 가능합니다.
        <div className="flex flex-row space-x-4">
          <Checkbox>공개</Checkbox>
          <Checkbox>비공개</Checkbox>
        </div>
        <div className="flex flex-col mt-4 space-x-4">
          <Checkbox>비밀번호 설정</Checkbox>
          <Input placeholder="비밀번호 입력"></Input>
        </div>
      </Fieldset>
      {/* TMP */}
      <div className="flex flex-col p-5">{children}</div>
    </div>
  );
};

export default ChatSettingBox;

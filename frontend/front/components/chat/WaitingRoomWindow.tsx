import React, { useEffect, useState } from "react";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import { Frame } from "@react95/core";
import SelectButton from "../common/SelectButton";

type newChatGroupListType = {
  id: number;
  chatGroupName: string;
  chatGroupPassward: string;
};

const ChatGroupList = () => {
  // name, passward 여부 가 있는 json 파일 예시
  const newChatGroupList: newChatGroupListType[] = [
    {
      id: 1,
      chatGroupName: "hi",
      chatGroupPassward: "비밀번호 있음",
    },
    {
      id: 2,
      chatGroupName: "hello",
      chatGroupPassward: "비밀번호 없음",
    },
    {
      id: 3,
      chatGroupName: "bye",
      chatGroupPassward: "비밀번호 있음",
    },
  ];

  const [chatGroupName, setChatGroupName] = useState<newChatGroupListType[]>([]);

  useEffect(() => {
    setChatGroupName((chatGroupName) => [...chatGroupName, ...newChatGroupList]);
  }, []);

  return (
    <Frame className="p-4" boxShadow="in" bg={"white"}>
      ChatGroupdiv
      <SelectButton></SelectButton>
      {chatGroupName.map((chatGroup) => (
        <div key={chatGroup.id}>
          <span>{chatGroup.chatGroupName}</span>
          <span>{chatGroup.chatGroupPassward}</span>
        </div>
      ))}
    </Frame>
  );
};

const WaitingRoomWindow = ({ className }: { className?: string }) => {
  const handleSettingBoxButton = () => {
    console.log("setting box button clicked");
  };

  const menuItems = [
    { name: "set-new-chat", handleClick: handleSettingBoxButton },
  ];

  return (
    <Window title="Waiting Room" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box => DM 에서도 쓸 거니가 Component화 하면 좋겠따*/}
        <Frame
          className="flex flex-col flex-1 overflow-auto p-1"
          boxShadow="in"
        >
          {/* main box */}
          Main Box
          <ChatGroupList />
        </Frame>
        {/* sub box */}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

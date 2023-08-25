import React, { useEffect, useState } from "react";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import { Button, Frame } from "@react95/core";
import MakeNewChatGroup from "./waiting_room_window/MakeNewChatGroup";
import type { GroupRoomStatusProps } from "./types/ChatProps";

// tmp data
const newChatGroupList: GroupRoomStatusProps[] = [
  {
    id: 1,
    chatType: "group",
    title: "hi hello 내가 누군지 아니 ! 트센이다 트센이다 트센이다 트센이다",
    password: true,
    private: false,
    numOfUser: 3,
  },
  {
    id: 2,
    chatType: "group",
    title: "hello",
    password: false,
    private: false,
    numOfUser: 10,
  },
  {
    id: 3,
    chatType: "group",
    title: "bye",
    password: false,
    private: false,
    numOfUser: 8,
  },
]; // TMP

// ChatGroupList 출력
const ChatGroupList = () => {
  const [chatGroupName, setChatGroupName] = useState<GroupRoomStatusProps[]>(
    []
  ); // Map으로 변경 필요 (겹치는 id 에 대한 관리가 필요함)

  useEffect(() => {
    setChatGroupName((chatGroupName) => [
      ...chatGroupName,
      ...newChatGroupList,
    ]);
  }, []);

  const handleClick = (chatGroup: GroupRoomStatusProps) => {
    console.log(chatGroup);
    if (chatGroup.password)
      console.log("비밀번호가 있습니다. 비밀번호를 입력해주세요");
    else console.log("비밀번호가 없습니다. 바로 입장합니다."); // tmp
    // backend에 해당 채팅방 참여 요청
    // 해당 채팅방 창 열고 참여하기
  };

  return (
    <Frame className="p-4" boxShadow="in" bg={"white"}>
      <div className="flex flex-row bg-stone-500 rounded-md text-white">
        <span className="flex-1  p-2">방제</span>
        <span className="w-16 p-2">[인원]</span>
        <span className="w-28 p-2">비밀번호 유무</span>
        <span className=" w-28">{""} </span>
      </div>
      {/* chatting room list */}
      {chatGroupName.map((chatGroup) => (
        <div className="flex flex-row m-1 bg-stone-200" key={chatGroup.id}>
          <span className="flex-1 p-2 font-bold truncate">
            {chatGroup.title}
          </span>
          <span className="w-16 p-2">[ {chatGroup.numOfUser} ]</span>
          <span className="w-28 p-2">
            {chatGroup.password ? "비밀번호 있음" : "비밀번호 없음"}
          </span>
          <Button
            className="w-28 h-3/4 "
            onClick={() => handleClick(chatGroup)}
          >
            참여하기
          </Button>
        </div>
      ))}
    </Frame>
  );
};

// main window
const WaitingRoomWindow = ({ className }: { className?: string }) => {
  const [showMakeChatGroupBox, setShowMakeChatGroupBox] =
    useState<boolean>(false);

  const handleMakeChatGroupBoxButton = () => {
    console.log("setting box button clicked");
    setShowMakeChatGroupBox((showMakeChatGroupBox) => !showMakeChatGroupBox);
  };

  const menuItems = [
    { name: "set-new-chat", handleClick: handleMakeChatGroupBoxButton },
  ];

  return (
    <Window title="Waiting Room" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* chat box */}
        <Frame
          className="flex flex-col flex-1 overflow-auto p-1"
          boxShadow="in"
        >
          <ChatGroupList />
        </Frame>
        {/* menu box */}
        {showMakeChatGroupBox ? <MakeNewChatGroup /> : null}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

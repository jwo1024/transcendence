import React, { useState } from "react";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import { Frame } from "@react95/core";
import MakeNewChatMenu from "./waiting_room_window/MakeNewChatMenu";
import ChatRoomListBox from "./waiting_room_window/ChatRoomListBox";

const WaitingRoomWindow = ({ className }: { className?: string }) => {
  const [showMakeNewChatMenu, setShowMakeNewChatMenu] =
    useState<boolean>(false);

  const handleMakeChatGroupBoxButton = () => {
    console.log("setting box button clicked");
    setShowMakeNewChatMenu((showMakeNewChatMenu) => !showMakeNewChatMenu);
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
        {/* ChatRoomList box */}
        <Frame
          className="flex flex-col flex-1 overflow-auto p-1"
          boxShadow="in"
        >
          <ChatRoomListBox />
        </Frame>
        {/* menu box */}
        {showMakeNewChatMenu ? <MakeNewChatMenu /> : null}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

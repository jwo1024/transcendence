import React, { useState } from "react";
import { Frame } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MakeNewChatMenu from "./waiting_room_window/MakeNewChatMenu";
import ChatRoomListBox from "./waiting_room_window/ChatRoomListBox";

import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";

const WaitingRoomWindow = ({ className }: { className?: string }) => {
  const menuItems: MenuItemInfo[] = [{ name: "set-new-chat" }];

  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);

  return (
    <Window title="Waiting Room" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* room list box */}
        <Frame
          className="flex flex-col flex-1 overflow-auto p-1"
          boxShadow="in"
        >
          <ChatRoomListBox />
        </Frame>
        {/* menu box */}
        {showMenuBox[0] ? <MakeNewChatMenu /> : null}
        {showMenuBox[1] ? <MakeNewChatMenu /> : null}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

// Libraies
import React, { useContext, useEffect } from "react";
import { Frame, Tabs, Tab } from "@react95/core";
// Components
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MakeNewChatMenu from "./waiting_room_window/MakeNewChatMenu";
import ChatRoomListBox from "./waiting_room_window/ChatRoomListBox";
import MakeNewDMMenuBox from "./waiting_room_window/MakeNewDMMenu";
// Types & Hooks & Contexts
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";
import { HandleChatOpenWindowContext } from "@/context/ChatOpenWindowContext";
import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import { SocketContext } from "@/context/ChatSocketContext";
import type { SimpRoomI, SimpUserI } from "@/types/ChatInfoType";
import { ON_ROOMS, ON_ME_JOINING_ROOMS } from "@/types/ChatSocketEventName";

interface WaitingRoomWindowProps {
  className?: string;
  userInfo: SimpUserI;
}

const WaitingRoomWindow = ({ className, userInfo }: WaitingRoomWindowProps) => {
  const socket = useContext(SocketContext);
  const menuItems: MenuItemInfo[] = [{ name: "New Chat" }, { name: "New DM" }];
  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);
  const waitingRoomState = useChatRoomListReducer();
  const joinedRoomState = useChatRoomListReducer();
  const handleOpenWindow = useContext(HandleChatOpenWindowContext);

  useEffect(() => {
    // 참여가능한 채팅방 목록 & 참여중인 채팅방 목록
    socket?.on(ON_ROOMS, (data) => {
      console.log("socket.on ON_ROOMS", data);
      const roomList: SimpRoomI[] = data;
      waitingRoomState.setListState({ roomList });
    }); // 궁금한것 : 형태가 다른 data가 들어오면 어떻게 되는가?
    // join !!!!
    socket?.on(ON_ME_JOINING_ROOMS, (data) => {
      console.log("socket.on ON_ME_JOINING_ROOMS", data);
      const roomList: SimpRoomI[] = data;
      joinedRoomState.setListState({ roomList });
    });
    return () => {
      socket?.off(ON_ROOMS);
      socket?.off(ON_ME_JOINING_ROOMS);
    };
  }, []);

  return (
    <Window title="Waiting Room" className={className} xOption={false}>
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* room list box */}
        <div className="flex flex-col flex-1 overflow-auto w-full h-full">
          <Tabs defaultActiveTab="입장가능한 채팅방 목록">
            <Tab title="입장가능한 채팅방 목록">
              {waitingRoomState && handleOpenWindow ? (
                <ChatRoomListBox
                  chatRoomState={waitingRoomState}
                  handleOpenWindow={handleOpenWindow}
                  isJoinedList={false}
                />
              ) : null}
            </Tab>
            <Tab title="참여중인 채팅방 목록">
              <Frame className="h-full" boxShadow="in">
                {waitingRoomState && handleOpenWindow ? (
                  <ChatRoomListBox
                    chatRoomState={joinedRoomState}
                    handleOpenWindow={handleOpenWindow}
                    isJoinedList={true}
                  />
                ) : null}
              </Frame>
            </Tab>
          </Tabs>
        </div>
        {/* menu box */}
        {showMenuBox[0] ? <MakeNewChatMenu /> : null}
        {showMenuBox[1] ? <MakeNewDMMenuBox userInfo={userInfo} /> : null}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

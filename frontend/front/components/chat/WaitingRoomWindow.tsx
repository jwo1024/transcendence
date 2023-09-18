// Libraies
import React, { useContext, useEffect } from "react";
import { Frame, Tabs, Tab } from "@react95/core";
// Components
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MakeNewChatMenu from "./waiting_room_window/MakeNewChatMenuBox";
import ChatRoomListBox from "./waiting_room_window/ChatRoomListBox";
import MakeNewDMMenuBox from "./waiting_room_window/MakeNewDMMenuBox";
// Types & Hooks & Contexts
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";
import { HandleChatOpenWindowContext } from "@/context/ChatOpenWindowContext";
import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import type { SimpRoomI, SimpUserI } from "@/types/ChatInfoType";
import { SocketContext } from "@/context/ChatSocketContext";

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
    socket?.on("rooms", ({ data }: { data: SimpRoomI[] }) => {
      waitingRoomState.setListState({ roomList: data });
    }); // 궁금한것 : 형태가 다른 data가 들어오면 어떻게 되는가?
    socket?.on("new-join-room", (data) => {
      joinedRoomState.addState({ roomData: data });
    });

    const roomList1: SimpRoomI[] = [
      {
        roomId: 1,
        roomName: "test room",
        roomType: "open",
        hasPass: true, // TODO : roomPass
        joinUsersNum: 0, // TODO : joinUsersNum
      },
    ];
    waitingRoomState.setListState({ roomList: roomList1 });
    const roomList2: SimpRoomI[] = [
      {
        roomId: 2,
        roomName: "joined room",
        roomType: "dm",
        hasPass: false, // TODO : roomPass
        joinUsersNum: 0, // TODO : joinUsersNum
      },
    ];
    joinedRoomState.setListState({ roomList: roomList2 });
    return () => {
      socket?.off("rooms");
      socket?.off("new-join-room");
    };
  }, []);

  return (
    <Window title="Waiting Room" className={className} xOption={false}>
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      {/* <div> */}
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

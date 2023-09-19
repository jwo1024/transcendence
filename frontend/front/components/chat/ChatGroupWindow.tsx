// Libraries
import { useState, useEffect, useContext } from "react";
import { Button, Frame, Input } from "@react95/core";
// Components
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import StatusBlock from "./chat_window/StatusBlock";
import SettingMenuBox from "./chat_window/SettingMenu";
import UserListMenuBox from "./chat_window/UserListMenuBox";
import LeaveRoomMenuBox from "./chat_window/LeaveRoomMenuBox";
// Types & Hooks & Contexts
import { MessageI, SimpUserI, SimpRoomI } from "@/types/ChatInfoType";
import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";
import { SocketContext } from "@/context/ChatSocketContext";

interface ChatGroupWindowProps {
  className?: string;
  userInfo: SimpUserI;
  roomInfo: SimpRoomI;
  customOnClickXOption?: () => void;
}

const ChatGroupWindow = ({
  className,
  userInfo,
  roomInfo,
  customOnClickXOption,
}: ChatGroupWindowProps) => {
  const socket = useContext(SocketContext);
  const [messageList, setMessageList] = useState<MessageI[]>([]);
  const { inputRef, sentMessage, setSentMessage, handleFormSubmit } =
    useMessageForm({
      roomInfo,
      userInfo: userInfo,
    });
  const [setUsers, setSetUsers] = useState<SimpUserI[]>([]); // TODO : roomInfo.users

  // chatRoom 에 대한  구체적인 정보 저장 필요
  const initMessageEvent = `messages_${roomInfo.roomId.toString}`;
  const currentRoomEvent = `current-room_${roomInfo.roomId.toString}`;
  const messageAddEvent = `messageAdded_${roomInfo.roomId.toString}`;

  useEffect(() => {
    // 초기데이터 받기 messages & user data
    socket?.on(initMessageEvent, (data) => {
      console.log("socket.on initMessageEvent: ", data);
      setMessageList((messageList) => [...messageList, data]);
      socket?.off(initMessageEvent);
    });
    socket?.on(currentRoomEvent, (data) => {
      console.log("socket.on current-room-id: ", data.users);
      setSetUsers(data.users); //
      socket?.off(currentRoomEvent);
    });
    socket?.emit("Room-enter", { roomId: roomInfo.roomId });

    // 메시지 받기
    socket?.on(messageAddEvent, (data) => {
      console.log("socket.on messageAdded: ", data);
      if (data.user.id === userInfo.id) setSentMessage(undefined);
      setMessageList((messageList) => [...messageList, data]);
    });
    return () => {
      socket?.off(messageAddEvent);
    };
  }, []);

  // sentMessage가 생성되면은 => 메시지 전송
  useEffect(() => {
    if (sentMessage === undefined || sentMessage.text === "") return;
    socket?.emit("Message-add", sentMessage);
  }, [sentMessage]);

  // Menu Items
  const menuItmes: MenuItemInfo[] = [
    { name: "Settings" },
    { name: "User-List" },
    { name: "Leave-Room" },
  ];
  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItmes);

  return (
    <Window
      title={`Chatting Room / ${roomInfo.roomName}`}
      className={className}
      customOnClickXOption={customOnClickXOption}
    >
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-col flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <Frame className="p-3" boxShadow="in" bg="white">
              <StatusBlock>{roomInfo.roomName}</StatusBlock>
              <StatusBlock>
                {roomInfo.hasPass ? "비밀번호있음" : "비밀번호없음"}
              </StatusBlock>
              <StatusBlock>
                {roomInfo.roomType === "open" ? "공개방" : "비공개방"}
              </StatusBlock>
              <StatusBlock>{`인원 [${roomInfo.joinUsersNum}명]`}</StatusBlock>
            </Frame>
            <MessageBox
              messageList={messageList}
              sentMessage={sentMessage}
              userInfo={userInfo}
            />
          </Frame>
          <form onSubmit={handleFormSubmit} className="flex flex-row p-1">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              ref={inputRef}
            />
            <Button>send</Button>
          </form>
        </div>
        {/* menu box */}
        {showMenuBox[0] ? <SettingMenuBox roomInfo={roomInfo} /> : null}
        {showMenuBox[1] ? (
          <UserListMenuBox userInfo={userInfo} roomInfo={roomInfo} />
        ) : null}
        {showMenuBox[2] ? <LeaveRoomMenuBox roomInfo={roomInfo} /> : null}
      </div>
    </Window>
  );
};

export default ChatGroupWindow;

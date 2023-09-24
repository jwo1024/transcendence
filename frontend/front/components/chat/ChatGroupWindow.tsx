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
import {
  RecvMessageDTO,
  SimpUserI,
  SimpRoomI,
  RoomI,
} from "@/types/ChatInfoType";
import {
  ON_MESSAGES_ROOMID,
  ON_CURRENT_ROOM_ROOMID,
  ON_MESSAGE_ADDED_ROOMID,
  EMIT_ROOM_ENTER,
  EMIT_MESSAGE_ADD,
} from "@/types/ChatSocketEventName";
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
  const [messageList, setMessageList] = useState<RecvMessageDTO[]>([]);
  const { inputRef, sentMessageList, deleteSentMessage, handleFormSubmit } =
    useMessageForm({
      roomInfo,
      userInfo,
    });
  const [setUsers, setSetUsers] = useState<SimpUserI[]>([]); // TODO : roomInfo.users
  const [roomInfoState, setRoomInfoState] = useState<RoomI | undefined>(
    undefined
  ); // TODO : roomInfo
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // TODO : check

  // chatRoom 에 대한  구체적인 정보 저장 필요
  const initMessageEvent = `messages_${roomInfo.roomId.toString}`;
  const currentRoomEvent = `current-room_${roomInfo.roomId.toString}`;
  const messageAddEvent = `messageAdded_${roomInfo.roomId.toString}`;

  useEffect(() => {
    // 초기데이터 받기 messages & user data
    setRoomInfoState({
      ...roomInfo,
      users: [
        { nickname: "user1", id: 98069 },
        { nickname: "user2", id: 99833 },
        { nickname: "user3", id: 98989 },
        { nickname: "user4", id: 11111 },
      ],
      roomOwner: 99800,
      roomAdmins: [99800],
      roomBanned: [11111],
      created_at: new Date(),
    }); // tmp
    checkAdmin();

    socket?.once(`${ON_MESSAGES_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGES_ROOMID: ", data);
      setMessageList((messageList) => [...messageList, data]);
    });
    socket?.once(`${ON_CURRENT_ROOM_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_CURRENT_ROOM_ROOMID: ", data.users);
      setSetUsers(data.users); //
    });
    socket?.emit(EMIT_ROOM_ENTER, { roomId: roomInfo.roomId });
    socket?.on(`${ON_MESSAGE_ADDED_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGE_ADDED_ROOMID: ", data);
      if (data.user.id === userInfo.id) deleteSentMessage(data);
      setMessageList((messageList) => [...messageList, data]);
    });

    return () => {
      socket?.off(`${ON_MESSAGE_ADDED_ROOMID}${roomInfo.roomId}`);
    };
  }, []);

  // sentMessage가 생성되면은 => 메시지 전송
  useEffect(() => {
    if (sentMessageList.length !== 0) return;
    sentMessageList.map((message) => {
      socket?.emit(EMIT_MESSAGE_ADD, message);
    });
  }, [sentMessageList]);

  const checkAdmin = () => {
    // TODO
    // if (roomInfoState?.roomOwner === userInfo.id) setIsAdmin(true);
    // else if (roomInfoState?.roomAdmins.find((admin) => admin === userInfo.id))
    //   setIsAdmin(true);
    // else setIsAdmin(false);
    setIsAdmin(true); // tmp
  };

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
              sentMessageList={sentMessageList}
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
        {showMenuBox[0] ? (
          <SettingMenuBox roomInfo={roomInfo} isAdmin={isAdmin} />
        ) : null}
        {showMenuBox[1] ? (
          <UserListMenuBox roomInfo={roomInfoState} isAdmin={isAdmin} />
        ) : null}
        {showMenuBox[2] ? (
          <LeaveRoomMenuBox
            roomInfo={roomInfo}
            triggerClose={customOnClickXOption}
          />
        ) : null}
      </div>
    </Window>
  );
};

export default ChatGroupWindow;

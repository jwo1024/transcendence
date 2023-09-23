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
  const { inputRef, sentMsgList, deleteSentMessage, handleFormSubmit } =
    useMessageForm({
      roomInfo,
      userInfo,
      socket,
    });
  const [roomInfoState, setRoomInfoState] = useState<RoomI | undefined>(
    undefined
  ); // TODO : roomInfo
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // TODO : check

  useEffect(() => {
    // 초기데이터 받기 messages & user data
    // setRoomInfoState({
    //   ...roomInfo,
    //   users: [
    //     { nickname: "user1", id: 98069 },
    //     { nickname: "user2", id: 99833 },
    //     { nickname: "user3", id: 98989 },
    //     { nickname: "user4", id: 11111 },
    //   ],
    //   roomOwner: 99800,
    //   roomAdmins: [99800],
    //   roomBanned: [11111],
    //   created_at: new Date(),
    // }); // tmp
    // room 초기 정보 가져오기
    // console.log("Check :ChatGroupWindow : Mount");
    inputRef.current?.focus();
    socket?.once(`${ON_MESSAGES_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGES_ROOMID: ", data);
      setMessageList((messageList) => [...messageList, data]);
    });
    socket?.once(`${ON_CURRENT_ROOM_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_CURRENT_ROOM_ROOMID: ", data.users);
      const roomData: RoomI = data;
      setRoomInfoState(roomData);
      checkAdmin();
    });
    socket?.emit(EMIT_ROOM_ENTER, { roomId: roomInfo.roomId });
    // 오는 메시지 듣기
    socket?.on(`${ON_MESSAGE_ADDED_ROOMID}${roomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGE_ADDED_ROOMID: ", data);
      const msg: RecvMessageDTO = data;
      if (msg.user.id === userInfo.id) deleteSentMessage(msg);
      adddMsgToList(msg);
    });

    return () => {
      socket?.off(`${ON_MESSAGE_ADDED_ROOMID}${roomInfo.roomId}`);
    };
  }, []);

  // utils
  const checkAdmin = () => {
    // TODO
    if (roomInfoState?.roomOwner === userInfo.id) setIsAdmin(true);
    else if (roomInfoState?.roomAdmins.find((admin) => admin === userInfo.id))
      setIsAdmin(true);
    else setIsAdmin(false);
    // setIsAdmin(true); // tmp
  };

  const adddMsgToList = (msg: RecvMessageDTO) => {
    if (
      messageList.length !== 0 &&
      messageList[messageList.length - 1].id >= msg.id
    )
      return;
    setMessageList((messageList) => [...messageList, msg]);
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
              sentMsgList={sentMsgList}
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

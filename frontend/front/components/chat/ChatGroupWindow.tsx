// Libraries
import { useState, useEffect, useContext } from "react";
import { Button, Frame, Input } from "@react95/core";
// Components
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import StatusBlock from "./chat_window/StatusBlock";
import SettingMenuBox from "./chat_window/SettingMenuBox";
import UserListMenuBox from "./chat_window/UserListMenuBox";
import LeaveRoomMenuBox from "./chat_window/LeaveRoomMenuBox";
import NotifyBlock from "../common/NotifyBlock";
// Types & Hooks & Contexts
import {
  RecvMessageDTO,
  SimpUserI,
  SimpRoomI,
  RoomI,
  ResponseDTO,
} from "@/types/ChatInfoType";
import {
  ON_MESSAGES_ROOMID,
  ON_CURRENT_ROOM_ROOMID,
  ON_MESSAGE_ADDED_ROOMID,
  ON_GOT_KICKED_ROOMID,
  ON_GOT_BANNED_ROOMID,
  ON_GOT_MUTED_ROOMID,
  EMIT_ROOM_ENTER,
  ON_RESPONSE_ROOM_ENTER_ROOMID,
} from "@/types/ChatSocketEventName";
import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";
import { SocketContext } from "@/context/ChatSocketContext";
import useTimerMute from "@/hooks/chat/useTimerMute";

interface ChatGroupWindowProps {
  className?: string;
  userInfo: SimpUserI;
  simpRoomInfo: SimpRoomI;
  blockIdList: number[];
  customOnClickXOption?: () => void;
}
const ChatGroupWindow = ({
  className,
  userInfo,
  simpRoomInfo,
  blockIdList,
  customOnClickXOption,
}: ChatGroupWindowProps) => {
  const socket = useContext(SocketContext);
  const [roomInfo, setRoomInfo] = useState<RoomI | undefined>(undefined);
  const [messageList, setMessageList] = useState<RecvMessageDTO[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notifyStr, setNotifyStr] = useState<string>("Loading");
  const { inputRef, sentMsgList, deleteSentMessage, handleFormSubmit } =
    useMessageForm({
      simpRoomInfo,
      userInfo,
      socket,
    }); // EMIT_MESSAGE_ADD occur inside of useMessageForm
  const { timeStr, setIssuedAt } = useTimerMute(3);

  useEffect(() => {
    socket?.on(`${ON_CURRENT_ROOM_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_CURRENT_ROOM_ROOMID: ", data);
      const roomData: RoomI = data;
      setRoomInfo(() => {
        checkAdmin(roomData);
        return roomData;
      });
    });
    socket?.once(`${ON_MESSAGES_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGES_ROOMID: ", data);
      const msgList: RecvMessageDTO[] = Array.from(data);
      if (msgList.length === 0) setMessageList([]);
      else setMessageList([...msgList]);
    });
    socket?.once(
      `${ON_RESPONSE_ROOM_ENTER_ROOMID}${simpRoomInfo.roomId}`,
      (data) => {
        console.log("socket.on ON_RESPONSE_ROOM_ENTER_ROOMID: ", data);
        const roomData: ResponseDTO = data;
        if (!roomData.success)
          setNotifyStr(
            ` 채팅방[${simpRoomInfo.roomName}] 입장에 실패하였습니다.`
          );
        else setNotifyStr("");
      }
    );
    console.log("socket?.emit EMIT_ROOM_ENTER ", simpRoomInfo.roomId);
    socket?.emit(EMIT_ROOM_ENTER, simpRoomInfo.roomId);

    socket?.on(`${ON_MESSAGE_ADDED_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_MESSAGE_ADDED_ROOMID: ", data);
      const msg: RecvMessageDTO = data;
      if (msg.user.id === userInfo.id) deleteSentMessage(msg);
      adddMsgToList(msg);
    });
    // on mute ! ! ! ! !
    socket?.on(`${ON_GOT_MUTED_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_GOT_MUTED_ROOMID: ", data);
      const msg: Date = data;
      console.log("msg: ", timeStr);
      timeStr === "" && msg && setIssuedAt(msg);
      // mute timer start ..... !
    });
    socket?.on(`${ON_GOT_KICKED_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_GOT_KICKED_ROOMID: ", data);
      alert("방에서 Kick 되었습니다.");
      triggerClose();
    });
    socket?.on(`${ON_GOT_BANNED_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_GOT_BANNED_ROOMID: ", data);
      alert("방에서 Ban 되었습니다.");
      triggerClose();
    });

    return () => {
      socket?.off(`${ON_MESSAGES_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_CURRENT_ROOM_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_RESPONSE_ROOM_ENTER_ROOMID}${simpRoomInfo.roomId}`);
      // socket?.off(`${ON_MESSAGE_ADDED_ROOMID}${simpRoomInfo.roomId}`); // 주석처리 for msgAlerm
      socket?.off(`${ON_GOT_MUTED_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_GOT_KICKED_ROOMID}${simpRoomInfo.roomId}`);
    };
  }, []);

  // Utils
  const checkAdmin = (roomData: RoomI) => {
    if (roomData?.roomOwner === userInfo.id) setIsAdmin(true);
    else if (roomData?.roomAdmins.find((admin) => admin === userInfo.id))
      setIsAdmin(true);
    else setIsAdmin(false);
  };

  const adddMsgToList = (msg: RecvMessageDTO) => {
    setMessageList((messageList) => {
      const lastElement = messageList.slice(-1)[0];
      if (lastElement && lastElement?.id >= msg.id) return messageList;
      return [...messageList, msg];
    });
  };

  const triggerClose = () => {
    customOnClickXOption && customOnClickXOption();
    socket?.off(`${ON_MESSAGE_ADDED_ROOMID}${simpRoomInfo.roomId}`);
  };

  // Menu Items
  const menuItmes: MenuItemInfo[] = [
    { name: "Settings" },
    { name: "User-List" },
    { name: "Leave-Channel" },
  ];
  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItmes);

  return (
    <Window
      title={simpRoomInfo.roomName}
      className={className}
      customOnClickXOption={customOnClickXOption}
    >
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      <div className="flex flex-row flex-1  overflow-auto">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-col flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <Frame className="p-3" boxShadow="in" bg="white">
              {roomInfo ? (
                <>
                  <StatusBlock>{roomInfo.roomName}</StatusBlock>
                  <StatusBlock>
                    {roomInfo.hasPass ? "비밀번호있음" : "비밀번호없음"}
                  </StatusBlock>
                  <StatusBlock>
                    {roomInfo.roomType === "open" ? "공개방" : "비공개방"}
                  </StatusBlock>
                  <StatusBlock>{`인원 [${roomInfo.users.length}명]`}</StatusBlock>
                  {timeStr !== "" ? (
                    <StatusBlock>🙊 {timeStr} 🙊</StatusBlock>
                  ) : null}
                </>
              ) : (
                <NotifyBlock>{notifyStr}</NotifyBlock>
              )}
            </Frame>
            <MessageBox
              blockIdList={blockIdList}
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
              disabled={roomInfo === undefined || timeStr !== ""}
            />
            <Button disabled={timeStr !== ""}>send</Button>
          </form>
        </div>
        {/* menu box */}
        {showMenuBox[0] && roomInfo ? (
          <SettingMenuBox
            roomInfo={roomInfo}
            isOwner={userInfo.id === roomInfo.roomOwner}
          />
        ) : null}
        {showMenuBox[1] && roomInfo ? (
          <UserListMenuBox
            roomInfo={roomInfo}
            isAdmin={isAdmin}
            userInfo={userInfo}
          />
        ) : null}
        {showMenuBox[2] && roomInfo ? (
          <LeaveRoomMenuBox roomInfo={roomInfo} triggerClose={triggerClose} />
        ) : null}
      </div>
    </Window>
  );
};

export default ChatGroupWindow;

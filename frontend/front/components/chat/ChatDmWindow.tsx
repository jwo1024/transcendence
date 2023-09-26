// Libraries
import { useState, useEffect, useContext } from "react";
import { Button, Frame, Input } from "@react95/core";
// Components
import Window from "@/components/common/Window";
import MenuBar from "@/components/common/MenuBar";
import MessageBox from "@/components/chat/chat_window/MessageBox";
import StatusBlock from "@/components/chat/chat_window/StatusBlock";
import MiniProfileMenuBox from "@/components/chat/chat_window/MiniProfileMenuBox";
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
  EMIT_ROOM_ENTER,
  ON_RESPONSE_ROOM_ENTER_ROOMID,
} from "@/types/ChatSocketEventName";
import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";
import { SocketContext } from "@/context/ChatSocketContext";

interface ChatDMWindowProps {
  className?: string;
  userInfo: SimpUserI;
  simpRoomInfo: SimpRoomI;
  blockIdList: number[];
  customOnClickXOption?: () => void;
}
const ChatDMWindow = ({
  className,
  userInfo,
  simpRoomInfo,
  blockIdList,
  customOnClickXOption,
}: ChatDMWindowProps) => {
  const socket = useContext(SocketContext);
  const [roomInfo, setRoomInfo] = useState<RoomI | undefined>(undefined);
  const [messageList, setMessageList] = useState<RecvMessageDTO[]>([]);
  const [friendInfo, setFriendInfo] = useState<SimpUserI | null>(null);
  const [notifyStr, setNotifyStr] = useState<string>("Loading");
  const { inputRef, sentMsgList, deleteSentMessage, handleFormSubmit } =
    useMessageForm({
      simpRoomInfo,
      userInfo,
      socket,
    }); // EMIT_MESSAGE_ADD occur inside of useMessageForm

  useEffect(() => {
    socket?.on(`${ON_CURRENT_ROOM_ROOMID}${simpRoomInfo.roomId}`, (data) => {
      console.log("socket.on ON_CURRENT_ROOM_ROOMID: ", data);
      const roomData: RoomI = data;
      setFriendInfo(
        roomData.users.find((user) => user.id !== userInfo.id) || null
      );
      setRoomInfo(roomData);
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
            ` DM방[${simpRoomInfo.roomName}] 입장에 실패하였습니다.`
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

    return () => {
      socket?.off(`${ON_MESSAGES_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_CURRENT_ROOM_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_RESPONSE_ROOM_ENTER_ROOMID}${simpRoomInfo.roomId}`);
      socket?.off(`${ON_MESSAGE_ADDED_ROOMID}${simpRoomInfo.roomId}`);
    };
  }, []);

  // Utils
  const adddMsgToList = (msg: RecvMessageDTO) => {
    setMessageList((messageList) => {
      const lastElement = messageList.slice(-1)[0];
      if (lastElement && lastElement?.id >= msg.id) return messageList;
      return [...messageList, msg];
    });
  };

  // Menu Items
  const menuItems: MenuItemInfo[] = [{ name: "FrreindProfile" }];
  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);

  return (
    <Window
      title={simpRoomInfo.roomName}
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
              {roomInfo ? (
                <StatusBlock>{`[${
                  friendInfo?.nickname || "Loading"
                }]의 신나는 DM 방`}</StatusBlock>
              ) : (
                <StatusBlock>{notifyStr}</StatusBlock>
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
            />
            <Button>send</Button>
          </form>
        </div>
        {/* menu box */}
        {showMenuBox[0] && friendInfo ? (
          <MiniProfileMenuBox freindInfo={friendInfo} userInfo={userInfo} />
        ) : null}
      </div>
    </Window>
  );
};

export default ChatDMWindow;

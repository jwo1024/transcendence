// Libraries
import { Button, Frame, Input } from "@react95/core";
import { useEffect, useContext, useRef, useState } from "react";
// Components
import type {
  RoomJoinDTO,
  SimpRoomI,
  ResponseDTO,
} from "@/types/ChatInfoType";
import NotifyBlock from "@/components/common/NotifyBlock";
// Types & Hooks & Contexts
import { SocketContext } from "@/context/ChatSocketContext";
import { ChatRoomStateI } from "@/hooks/chat/useChatRoomListReducer";
import { HandleChatOpenWindowContextI } from "@/context/ChatOpenWindowContext";
import { roomType } from "@/types/ChatInfoType";
import {
  EMIT_ROOM_JOIN,
  ON_RESPONSE_ROOM_JOIN,
  ON_MESSAGE_ADDED_ROOMID,
} from "@/types/ChatSocketEventName";

// ChatRoomBlock
interface ChatRoomBlockProps {
  chatRoom: SimpRoomI;
  handleOpenWindow: HandleChatOpenWindowContextI;
  isJoinedList: boolean;
}
const ChatRoomBlock = ({
  chatRoom,
  handleOpenWindow,
  isJoinedList,
}: ChatRoomBlockProps) => {
  const socket = useContext(SocketContext);
  const passInputRef = useRef<HTMLInputElement>(null);
  const [notifyStr, setNotifyStr] = useState<string>("");

  const joinRoom = (chatGroup: SimpRoomI) => {
    if (chatGroup.hasPass && passInputRef.current?.value === "")
      return setNotifyStr("비밀번호를 입력해주세요");
    const roomDTO = (): RoomJoinDTO => {
      if (chatGroup.hasPass) {
        return {
          roomId: chatGroup.roomId,
          roomPass: passInputRef.current?.value || "",
        };
      } else return { roomId: chatGroup.roomId };
    };
    socket?.once(ON_RESPONSE_ROOM_JOIN, (data) => {
      const res: ResponseDTO = data;
      console.log("join room response : ", data);
      setNotifyStr(() => {
        if (!res.success)
          return `채팅채널 입장에 살패하였습니다 : ${res.message}`;
        else if (confirm("채팅채널에 입장 하시겠습니다!")) {
          handleOpenWindow?.addOpenWindow({ roomData: chatRoom });
          setMsgAlert(false);
          return "";
        } else return "";
      });
    });
    console.log("!join room : ", roomDTO());
    socket?.emit(EMIT_ROOM_JOIN, roomDTO());
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isJoinedList) joinRoom(chatRoom);
    else {
      handleOpenWindow?.addOpenWindow({ roomData: chatRoom });
      setMsgAlert(false);
    }
  };

  // MSG ALERT
  const [msgAlert, setMsgAlert] = useState<boolean>(false);
  const onMessageAdded = () => {
    console.log("MSG ALERT ");
    setMsgAlert(true);
  };
  useEffect(() => {
    if (isJoinedList) {
      socket?.on(
        `${ON_MESSAGE_ADDED_ROOMID}${chatRoom.roomId}`,
        onMessageAdded
      );
    }
    return () => {
      socket?.off(ON_MESSAGE_ADDED_ROOMID, onMessageAdded);
      socket?.off(ON_RESPONSE_ROOM_JOIN);
    };
  }, []);

  // inner component AlermCircle
  interface AlermCircleProps {
    isJoinedList: boolean;
    type: roomType;
  }
  const AlermCircle = ({ isJoinedList, type }: AlermCircleProps) => {
    // TODO : with : surlee : alert 창 띄우기
    if (!isJoinedList) return null;
    if (type === "dm") {
      return (
        <div className="rounded-full bg-rose-500 h-2 w-2 inline-block ml-2" />
      );
    }
    return (
      <div className="rounded-full bg-green-500 h-2 w-2 inline-block ml-2" />
    );
  };

  // form ?
  return (
    <div className="flex flex-row m-1 bg-stone-200" key={chatRoom.roomId}>
      <span className="flex-1 p-2 font-bold truncate">
        {chatRoom.roomName}
        {msgAlert
          ? AlermCircle({ isJoinedList, type: chatRoom.roomType })
          : null}
      </span>
      <span className="w-16 p-2">[ {chatRoom.joinUsersNum} ]</span>
      <form onSubmit={handleSubmit}>
        <span className="w-230 p-1">
          {isJoinedList ? null : (
            <>
              {chatRoom.hasPass ? (
                // minlegnth & maxlength 적용안됨 (왜?)
                <Input
                  ref={passInputRef}
                  type="password"
                  placeholder="password"
                  className=" w-24"
                  maxlength="5"
                  minlength="1"
                />
              ) : (
                "비밀번호 없음"
              )}
            </>
          )}
        </span>
        <Button className="w-30 h-3/4 ">
          {isJoinedList ? "채팅창열기" : "참여하기"}
        </Button>
      </form>
      <NotifyBlock>{notifyStr}</NotifyBlock>
    </div>
  );
};

// ChatRoomListBox
interface ChatRoomListBoxProps {
  chatRoomState: ChatRoomStateI;
  handleOpenWindow: HandleChatOpenWindowContextI;
  isJoinedList: boolean;
}
const ChatRoomListBox = ({
  chatRoomState,
  handleOpenWindow,
  isJoinedList = false,
}: ChatRoomListBoxProps) => {
  const state = chatRoomState.state;
  // const [alertJoinRoom, setAlertJoinRoom] = useState<RoomJoinDTO | null>(null);

  return (
    <Frame className="p-4 overflow-auto" boxShadow="in" bg={"white"}>
      <div className="flex flex-row bg-stone-500 rounded-md text-white overflow-auto">
        <span className="flex-1  p-2">
          {isJoinedList ? "~참여중인 채팅방~" : "~입장가능한 채팅방~"}
        </span>
        <span className="w-16 p-2">[인원]</span>
        <span className="w-28 p-2">
          {isJoinedList ? null : "비밀번호 유무"}
        </span>
        <span className=" w-32">{"   "} </span>
      </div>
      <div className="overflow-auto">
        {/* chat room list */}
        {state?.map((chatRoom) => (
          <ChatRoomBlock
            key={chatRoom.roomId}
            chatRoom={chatRoom}
            handleOpenWindow={handleOpenWindow}
            isJoinedList={isJoinedList}
          />
        ))}
      </div>
    </Frame>
  );
};

export default ChatRoomListBox;

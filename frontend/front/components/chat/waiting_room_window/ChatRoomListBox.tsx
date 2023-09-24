// Libraries
import { Button, Frame, Input } from "@react95/core";
import { useEffect, useContext, useRef } from "react";
// Components
import type { RoomJoinDTO, SimpRoomI } from "@/types/ChatInfoType";
// Types & Hooks & Contexts
import { SocketContext } from "@/context/ChatSocketContext";
import { ChatRoomStateI } from "@/hooks/chat/useChatRoomListReducer";
import { HandleChatOpenWindowContextI } from "@/context/ChatOpenWindowContext";
import { roomType } from "@/types/ChatInfoType";
import { EMIT_ROOM_JOIN } from "@/types/ChatSocketEventName";

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

  const handleClickJoin = (chatGroup: SimpRoomI) => {
    console.log(chatGroup);
    if (chatGroup.hasPass) {
      // 비밀번호 입력시 input값 암호화해야함
      console.log("비밀번호가 있습니다. 비밀번호를 입력해주세요");
      socket?.emit(EMIT_ROOM_JOIN, {
        roomId: chatGroup.roomId,
        roomPass: passInputRef.current?.value,
      });
      handleOpenWindow?.addOpenWindow({ roomData: chatGroup });
    } else {
      console.log("비밀번호가 없습니다. 바로 입장합니다.");
      socket?.emit(EMIT_ROOM_JOIN, { roomId: chatGroup.roomId });
      handleOpenWindow?.addOpenWindow({ roomData: chatGroup });
    }
    // TODO : wask surlee ? : join - enter - 어떻게 하기로 햇는지 다 까먹었음
    // socket?.emit(EMIT_ROOM_JOIN, { roomId: chatGroup.roomId });
    // handleOpenWindow?.addOpenWindow({ roomData: chatGroup });
  };

  interface AlermViewProps {
    isJoinedList: boolean;
    type: roomType;
  }
  const AlermView = ({ isJoinedList, type }: AlermViewProps) => {
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
        {AlermView({ isJoinedList, type: chatRoom.roomType })}
      </span>
      <span className="w-16 p-2">[ {chatRoom.joinUsersNum} ]</span>
      <span className="w-230 p-1">
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
      </span>
      <Button className="w-28 h-3/4 " onClick={() => handleClickJoin(chatRoom)}>
        참여하기
      </Button>
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
        <span className="flex-1  p-2">방제</span>
        <span className="w-16 p-2">[인원]</span>
        <span className="w-28 p-2">비밀번호 유무</span>
        <span className=" w-28">{""} </span>
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

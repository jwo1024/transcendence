import { Button, Frame } from "@react95/core";
import useCustomReducer from "../waiting_room_window/hooks/useCustomReducer";
import type { ChatRoomInfo } from "@/types/ChatInfoType";

const ChatRoomListBox = () => {
  const { state, addState, removeState } = useCustomReducer();

  const handleClick = (chatGroup: ChatRoomInfo) => {
    console.log(chatGroup);
    if (chatGroup.password)
      console.log("비밀번호가 있습니다. 비밀번호를 입력해주세요");
    else console.log("비밀번호가 없습니다. 바로 입장합니다."); // tmp
    // backend에 해당 채팅방 참여 요청
    // 해당 채팅방 창 열고 참여하기
  };

  return (
    <Frame className="p-4" boxShadow="in" bg={"white"}>
      <div className="flex flex-row bg-stone-500 rounded-md text-white">
        <span className="flex-1  p-2">방제</span>
        <span className="w-16 p-2">[인원]</span>
        <span className="w-28 p-2">비밀번호 유무</span>
        <span className=" w-28">{""} </span>
      </div>
      {/* chatting room list */}
      {state.list.map((chatGroup) => (
        <div className="flex flex-row m-1 bg-stone-200" key={chatGroup.id}>
          <span className="flex-1 p-2 font-bold truncate">
            {chatGroup.title}
          </span>
          <span className="w-16 p-2">[ {chatGroup.numOfUser} ]</span>
          <span className="w-28 p-2">
            {chatGroup.password ? "비밀번호 있음" : "비밀번호 없음"}
          </span>
          <Button
            className="w-28 h-3/4 "
            onClick={() => handleClick(chatGroup)}
          >
            참여하기
          </Button>
        </div>
      ))}
    </Frame>
  );
};

export default ChatRoomListBox;
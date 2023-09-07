import { Button, Frame } from "@react95/core";

import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import type { ChatRoomInfo, ChatRoomListInfo } from "@/types/ChatInfoType";
import { useEffect } from "react";

const ChatRoomListBox = () => {
  const { state, addState, removeState, addListState } =
    useChatRoomListReducer();

  useEffect(() => {
    addChatRoomList();
    console.log("CHECK : ChatRoomListBox : MOUNT");
    return () => {
      console.log("CHECK : ChatRoomListBox : UNMOUNT");
    };
  }, []);
  console.log("CHECK : ChatRoomListBox : RENDER");

  const addChatRoom = () => {
    // get data from server
    const roomData: ChatRoomInfo = {
      id: 10,
      chatType: "group",
      title: "test",
      isPublic: true,
      password: false,
      numOfUser: 1,
    };
    addState({ roomData });
  };

  const addChatRoomList = () => {
    fetch("/api/chat_list")
      .then((res) => {
        console.log("then1");
        if (res.ok) {
          console.log("then2 res.ok");
          res.json().then((data) => {
            console.log("then3 res.json()");
            const addList: ChatRoomListInfo = data;
            // if data structure is not correct, this line will cause error
            addListState({ addList });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const removeChatRoom = () => {
    // get data from server
    const roomId = 10;
    removeState({ roomId });
  };

  const handleClickJoin = (chatGroup: ChatRoomInfo) => {
    console.log(chatGroup);
    if (chatGroup.password) {
      console.log("비밀번호가 있습니다. 비밀번호를 입력해주세요");
      // 비밀번호 입력시 input값 암호화해야함
    } else console.log("비밀번호가 없습니다. 바로 입장합니다."); // tmp
    // send request to backend to join chat room

    // 해당 채팅방 창 열고 참여하기
    // TODO : 채팅방 리스트 => 채팅방참여로 연결하기 + 현재 머무는 채팅방 리스트 관리 (localstorage)
    // TODO : 채팅방창에서 유저 클릭시 추가되는 기능 구현
  };

  return (
    <Frame className="p-4" boxShadow="in" bg={"white"}>
      <div className="flex flex-row bg-stone-500 rounded-md text-white">
        <span className="flex-1  p-2">방제</span>
        <span className="w-16 p-2">[인원]</span>
        <span className="w-28 p-2">비밀번호 유무</span>
        <span className=" w-28">{""} </span>
      </div>
      {/* chat room list */}
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
            onClick={() => handleClickJoin(chatGroup)}
          >
            참여하기
          </Button>
        </div>
      ))}
    </Frame>
  );
};

export default ChatRoomListBox;

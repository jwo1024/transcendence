import React, { useEffect, useState, useContext } from "react";
import { Button } from "@react95/core";

import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";
import type { ChatRoomInfo } from "@/types/ChatInfoType";

import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";

// import { useSocket } from "@/hooks/chat/useSocket";
import { CurrentPageContext } from "@/context/PageContext";

const ChatPage = () => {
  const { setCurrentPage } = useContext(CurrentPageContext);
  const [chatGroup, setChatGroup] = useState<boolean>(true);
  const [waitingRoom, setWaitingRoom] = useState<boolean>(false);
  const [chatDM, setChatDM] = useState<boolean>(false); /// 교체 및 삭제 필요
  const { state, addState, removeState } = useChatRoomListReducer();

  useEffect(() => {
    setCurrentPage("Chat-Page");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // tmp
  const showChatGroupButton = () => {
    setChatGroup((chatGroup) => !chatGroup);
  };

  const showWaitingRoomButton = () => {
    setWaitingRoom((waitingRoom) => !waitingRoom);
  };

  const showChatDMButton = () => {
    setChatDM((chatDM) => !chatDM);
  };

  // screen resize
  const [felxRow, setFelxRow] = useState<boolean>(true);

  const handleResize = () => {
    setFelxRow(window.innerWidth > window.innerHeight);
  };

  // join room
  const addJoinRoomList = () => {
    // get data from sever
    const roomData: ChatRoomInfo = {
      id: 10,
      chatType: "group",
      title: "test",
      isPublic: true,
      password: false,
      numOfUser: 1,
    }; // tmp data
    addState({ roomData });
    // addState(newJoinRoom);
  };

  const deleteJoinRoomList = () => {
    const roomId = 10;
    removeState({ roomId });
  };

  // TODO : useChatRoomListReducer.tsx 로 관리하기
  const getJoinRoomInfo = (id: number) => {
    const joinRoomList: ChatRoomInfo = {
      id: -1,
      chatType: "group",
      title: "test",
      isPublic: true,
      password: false,
      numOfUser: 1,
    }; // tmp data
    const target = state.list.find((room: ChatRoomInfo) => room.id === id);
    return target ? target : joinRoomList;
  };

  return (
    <div className="m-2 max-w-screen ">
      <div
        className={felxRow ? "flex flex-row h-90vh" : "flex flex-col h-90vh"}
      >
        {/* TODO : set ChatRoomInfo and show window */}
        {/*
          for waiting room data
          joinRoomList : ChatRoomInfo[];

          뭔가 순서대로 정보를 가지고 있다가 3개의 창만 보여줬으면 하는데...
        */}
        {waitingRoom ? <WaitingRoomWindow /> : null}
        {/* {chatGroup ? (
          <ChatGroupWindow
            chatRoomData={getJoinRoomInfo(1)}
            customOnClickXOption={customOnClickXOption}
          />
        ) : null}
        {chatDM ? <ChatDmWindow chatRoomData={getJoinRoomInfo(2)} /> : null} */}
      </div>
      <Button className="m-1" onClick={showChatGroupButton}>
        tmp chat room
      </Button>
      <Button className="m-1" onClick={showWaitingRoomButton}>
        tmp waiting room
      </Button>
      <Button className="m-1" onClick={showChatDMButton}>
        tmp DM room
      </Button>
    </div>
  );
};

export default ChatPage;

// 클릭을한다 => 서버에 여기에 들어가고싶어요를 요청한다
// 그다음에 join 에 성공한다면 joinlist 에 등록을 한다. => 창을 띄운다.

// 이미 조인이 되어있다면 => 그냥 들어간다.
// 아마도

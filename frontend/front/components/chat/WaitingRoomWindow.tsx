import React, { useEffect, useReducer, useState } from "react";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import { Button, Frame } from "@react95/core";
import MakeNewChatGroup from "./waiting_room_window/MakeNewChatGroup";
import type { ChatRoomInfo, ChatRoomListInfo } from "./types/ChatProps";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";

// var index = arr3.findIndex(i => i.name == "강호동");

type Action =
  | { type: "ADD"; room: ChatRoomInfo }
  | { type: "REMOVE"; id: number }
  | { type: "ADD_LIST"; lists: ChatRoomListInfo };

const reducer = (state: ChatRoomListInfo, action: Action) => {
  console.log(state);
  switch (action.type) {
    case "ADD": {
      return { list: [...state.list, action.room] };
    }
    case "REMOVE": {
      return {
        list: state.list.filter((item) => item.id !== action.id),
      };
    }
    case "ADD_LIST": {
      // const newList = state
      return { list: [...state.list, ...action.lists.list] };
    }
    default:
      return state;
  }
};

// ChatGroupList 출력
const ChatGroupBlock = () => {
  const [state, dispatch] = useReducer(reducer, { list: [] });

  useEffect(() => {
    console.log("useEffect");

    fetch("/api/chat_list")
      .then((res) => {
        console.log("then1");

        if (res.ok) {
          console.log("then2 res.ok");

          res.json().then((data) => {
            console.log("then3 res.json()");

            dispatch({ type: "ADD_LIST", lists: data });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const addState = ({ roomData }: { roomData: ChatRoomInfo }) => {
    dispatch({ type: "ADD", room: roomData });
  };

  const removeState = ({ roomId }: { roomId: number }) => {
    dispatch({ type: "REMOVE", id: roomId });
  };

  // const addListState = ({ addlist }: { addlist: ChatRoomListInfo }) => {
  //   dispatch({ type: "ADD_LIST", lists: addlist });
  // };

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

// main window
const WaitingRoomWindow = ({ className }: { className?: string }) => {
  const [showMakeChatGroupBox, setShowMakeChatGroupBox] =
    useState<boolean>(false);

  const handleMakeChatGroupBoxButton = () => {
    console.log("setting box button clicked");
    setShowMakeChatGroupBox((showMakeChatGroupBox) => !showMakeChatGroupBox);
  };

  const menuItems = [
    { name: "set-new-chat", handleClick: handleMakeChatGroupBoxButton },
  ];

  return (
    <Window title="Waiting Room" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* chat box */}
        <Frame
          className="flex flex-col flex-1 overflow-auto p-1"
          boxShadow="in"
        >
          <ChatGroupBlock />
        </Frame>
        {/* menu box */}
        {showMakeChatGroupBox ? <MakeNewChatGroup /> : null}
      </div>
    </Window>
  );
};

export default WaitingRoomWindow;

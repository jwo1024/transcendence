// this hook is for "@/components/chat/waiting_room_window/ChatRoomListBox"

// rename to useChatRoomListReducer
// index 비교해서 업데이트하는 기능 추가 필요
// var index = arr3.findIndex(i => i.name == "강호동");

import type { ChatRoomInfo, ChatRoomListInfo } from "@/types/ChatInfoType";
import { useReducer, useEffect } from "react";

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
const useChatRoomListReducer = () => {
  const [state, dispatch] = useReducer(reducer, { list: [] });

  useEffect(() => {
    console.log("CHECK : useChatRoomListReducer : MOUNT");
    return () => {
      console.log("CHECK : useChatRoomListReducer : UNMOUNT");
    };
  }, []);
  console.log("CHECK : useChatRoomListReducer : RENDER");

  const addState = ({ roomData }: { roomData: ChatRoomInfo }) => {
    dispatch({ type: "ADD", room: roomData });
  };

  const removeState = ({ roomId }: { roomId: number }) => {
    dispatch({ type: "REMOVE", id: roomId });
  };

  const addListState = ({ addList }: { addList: ChatRoomListInfo }) => {
    dispatch({ type: "ADD_LIST", lists: addList });
  };

  return { state, addState, removeState, addListState } as const;
};

export default useChatRoomListReducer;

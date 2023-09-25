// this hook is for "@/components/chat/waiting_room_window/ChatRoomListBox"

// rename to useChatRoomListReducer
// index 비교해서 업데이트하는 기능 추가 필요
// var index = arr3.findIndex(i => i.name == "강호동");

// import type { ChatRoomInfo, ChatRoomListInfo } from "@/types/ChatInfoType";
import { useEffect, useReducer } from "react";
import type { SimpRoomI } from "@/types/ChatInfoType";

interface ChatRoomStateI {
  state: SimpRoomI[];
  addState: ({ roomData }: { roomData: SimpRoomI }) => void;
  removeState: ({ roomId }: { roomId: number }) => void;
  setListState: ({ roomList }: { roomList: SimpRoomI[] }) => void;
}

type Action =
  | { type: "ADD"; room: SimpRoomI }
  | { type: "REMOVE"; roomId: number }
  | { type: "SET_LIST"; roomList: SimpRoomI[] };

const reducer = (state: SimpRoomI[], action: Action) => {
  console.log(state);
  switch (action.type) {
    case "ADD": {
      if (state.length >= 5) {
        alert("창은 5개까지만@!");
        return state;
      }
      if (state.some((item) => item.roomId === action.room.roomId))
        return state;
      return [...state, action.room];
    }
    case "REMOVE": {
      return state.filter((item) => item.roomId !== action.roomId);
    }
    case "SET_LIST": {
      // const newList = state
      if (!action.roomList || action.roomList?.length === 0) return [];
      return [...action.roomList];
    }
    default:
      return state;
  }
};

const useChatRoomListReducer = () => {
  const [state, dispatch] = useReducer(reducer, [] as SimpRoomI[]);

  useEffect(() => {
    console.log("useChatRoomListReducer");
    console.log(state);
    return () => {};
  }, [state]);

  const addState = ({ roomData }: { roomData: SimpRoomI }) => {
    dispatch({ type: "ADD", room: roomData });
  };

  const removeState = ({ roomId }: { roomId: number }) => {
    dispatch({ type: "REMOVE", roomId: roomId });
  };

  const setListState = ({ roomList }: { roomList: SimpRoomI[] }) => {
    dispatch({ type: "SET_LIST", roomList: roomList });
  };

  return { state, addState, removeState, setListState } as const;
};

export default useChatRoomListReducer;
export type { SimpRoomI, ChatRoomStateI };

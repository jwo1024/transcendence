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

  return { state, addState, removeState } as const;
};

export default useChatRoomListReducer;

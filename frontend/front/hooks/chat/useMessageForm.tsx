import { ChangeEvent, useRef, useReducer } from "react";
import {
  SimpRoomI,
  SimpUserI,
  SendMessageDTO,
  RecvMessageDTO,
} from "@/types/ChatInfoType";
import { Socket } from "socket.io-client";
import { EMIT_MESSAGE_ADD } from "@/types/ChatSocketEventName";

type Action =
  | { type: "ADD"; message: SendMessageDTO }
  | { type: "REMOVE"; message: RecvMessageDTO };

const reducer = (sentMsgList: SendMessageDTO[], action: Action) => {
  switch (action.type) {
    case "ADD": {
      return [...sentMsgList, action.message];
    }
    case "REMOVE": {
      const indexToRemove = sentMsgList.findIndex((message) => {
        return (
          message.text === action.message.text &&
          message.userId === action.message.user.id
        );
      });
      // 왜 안됨 ?
      console.log("! sentMsgList", sentMsgList.length);
      console.log("! indexToRemove", indexToRemove);
      console.log("! seentMsgList[indexToRemove]", sentMsgList.splice(0, 1));
      if (indexToRemove !== -1) return sentMsgList.splice(indexToRemove, 1);
      return sentMsgList;
    }
    default:
      return sentMsgList;
  }
};

// useMessageReducer ... !
interface useMessageFormProps {
  simpRoomInfo: SimpRoomI;
  userInfo: SimpUserI;
  socket: Socket | undefined;
}
const useMessageForm = ({
  simpRoomInfo,
  userInfo,
  socket,
}: useMessageFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sentMsgList, dispatch] = useReducer(reducer, [] as SendMessageDTO[]);

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  };

  const handleSendMessage = () => {
    const messageData: SendMessageDTO = {
      roomId: simpRoomInfo.roomId,
      userId: userInfo?.id || -1,
      text: inputRef.current?.value || "",
    };
    if (messageData.text === "") return;
    dispatch({ type: "ADD", message: messageData });
    console.log("socket?.emit(EMIT_MESSAGE_ADD, messageData)", messageData);
    socket?.emit(EMIT_MESSAGE_ADD, messageData); // 보낼때
    resetInputMessage();
  };

  const resetInputMessage = () => {
    if (inputRef.current?.value === undefined) return;
    inputRef.current.value = "";
  };

  const deleteSentMessage = (msg: RecvMessageDTO) => {
    if (msg.user.id !== userInfo.id) return;
    dispatch({ type: "REMOVE", message: msg });
  };

  return {
    inputRef,
    sentMsgList,
    deleteSentMessage,
    handleFormSubmit,
  };
};

export default useMessageForm;

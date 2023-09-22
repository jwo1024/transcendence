import { ChangeEvent, useRef, useReducer } from "react";
import {
  SimpRoomI,
  SimpUserI,
  SendMessageDTO,
  RecvMessageDTO,
} from "@/types/ChatInfoType";

interface useMessageFormProps {
  roomInfo: SimpRoomI;
  userInfo: SimpUserI;
}

type Action =
  | { type: "ADD"; message: SendMessageDTO }
  | { type: "REMOVE"; message: RecvMessageDTO };

const reducer = (sentMessageList: SendMessageDTO[], action: Action) => {
  switch (action.type) {
    case "ADD": {
      return [...sentMessageList, action.message];
    }
    case "REMOVE": {
      const indexToRemove = sentMessageList.findIndex((message) => {
        message.text === action.message.text &&
          message.userId === action.message.user.id;
      });
      if (indexToRemove !== -1) return sentMessageList.splice(indexToRemove, 1);
      return sentMessageList;
    }
    default:
      return sentMessageList;
  }
};

const useMessageForm = ({ roomInfo, userInfo }: useMessageFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sentMessageList, dispatch] = useReducer(reducer, [] as SendMessageDTO[]);

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  const handleSendMessage = () => {
    const messageData: SendMessageDTO = {
      roomId: roomInfo.roomId,
      userId: userInfo?.id || -1,
      text: inputRef.current?.value || "",
    };
    if (messageData.text === "") return;
    dispatch({ type: "ADD", message: messageData });
    // setSentMessage(messageData);
    resetInputMessage();
  };

  const deleteSentMessage = (message: RecvMessageDTO) => {
    dispatch({ type: "REMOVE", message: message });
  };

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  };

  return {
    inputRef,
    sentMessageList,
    deleteSentMessage,
    // handleSendMessage,
    handleFormSubmit,
  };
};

export default useMessageForm;

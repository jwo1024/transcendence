import { ChangeEvent, useState, useRef, useEffect, useContext } from "react";
import { SimpRoomI, SimpUserI, MessageDTO } from "@/types/ChatInfoType";

interface useMessageFormProps {
  roomInfo: SimpRoomI;
  userInfo: SimpUserI;
}

const useMessageForm = ({ roomInfo, userInfo }: useMessageFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sentMessage, setSentMessage] = useState<MessageDTO>();

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  // send message to server
  const handleSendMessage = () => {
    console.log("useMessageForm.tsx : roomInfo : ", roomInfo);
    // if (userInfo.id === -1 || roomInfo.id === -1) return;
    // send message data
    const messageData: MessageDTO = {
      roomId: roomInfo.roomId,
      userId: userInfo?.id || -1,
      text: inputRef.current?.value || "",
    };
    setSentMessage(messageData);
    resetInputMessage();
  };

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  };

  return {
    inputRef,
    sentMessage,
    setSentMessage,
    handleSendMessage,
    handleFormSubmit,
  };
};

export default useMessageForm;

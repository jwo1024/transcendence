import React, { ReactNode, useState } from "react";

import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";

import { Button } from "@react95/core";

interface ChatProps {
  children?: ReactNode;
}

const ChatPage = ({ children }: ChatProps) => {
  const [chatGroup, setChatGroup] = useState<boolean>(true);
  const [waitingRoom, setWaitingRoom] = useState<boolean>(false); 
  const [ChatDM, setChatDM] = useState<boolean>(false); /// 교체 및 삭제 필요

  const showChatGroupButton = () => {
    setWaitingRoom((waitingRoom) => !waitingRoom);
    setChatGroup(false);
    setChatDM(false);
  };

  const showWaitingRoomButton = () => {
    setChatGroup((chatGroup) => !chatGroup);
    setWaitingRoom(false);
    setChatDM(false);
  };

  const showChatDMButton = () => {
    setChatDM((ChatDM) => !ChatDM);
    setChatGroup(false);
    setWaitingRoom(false);
  };

  return (
    <div className="m-2">
      <div className="flex flex-row  h-90vh ">
        {chatGroup ? <ChatGroupWindow /> : null}
        {waitingRoom ? <WaitingRoomWindow /> : null}
        {ChatDM ? <ChatDmWindow /> : null}
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

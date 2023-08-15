import React, { ReactNode, useState } from "react";

import ChatRoomWindow from "@/components/chat/ChatRoomWindow";
import ChatSettingWindow from "@/components/chat/ChatSettingWindow";

import { Button } from "@react95/core";

interface ChatProps {
  children?: ReactNode;
}

const ChatPage = ({ children }: ChatProps) => {
  const [chatRoom, setChatRoom] = useState<string>("");
  const [waitingRoom, setWaitingRoom] = useState<boolean>(true);

  const switchToWaitingRoom = () => {
    setWaitingRoom((waitingRoom) => !waitingRoom); // 이게 맞나 기억이 안나
    console.log("switchToWaitingRoom");
  };

  return (
    <>
      <div className="flex flex-row border-2 border-black h-96 w-full ">
        {children}
        {waitingRoom ? (
          <>
            <div className="flex flex-col border-2 border-purple-400 h-full w-full">
              <ChatRoomWindow />
            </div>
            
          </>
        ) : (
          <div className="flex flex-col border-2 border-blue-500 h-full w-full">
            WaitingRoomWindow
          </div>
        )}
      </div>
      <div>
        <Button onClick={switchToWaitingRoom}>Waiting Room</Button>
        <Button>Chat Room</Button>
      </div>
    </>
  );
};

export default ChatPage;

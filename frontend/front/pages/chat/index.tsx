import React, { ReactNode } from "react";

import ChatRoomWindow from "@/components/chat/ChatRoomWindow";
import ChatSettingWindow from "@/components/chat/ChatSettingWindow";

interface ChatProps {
  children?: ReactNode;
}

const ChatPage = ({ children }: ChatProps) => {
  return (
    <div className="flex flex-row border-2 border-black h-80 w-full ">
     {children}
      <ChatRoomWindow />
      <ChatSettingWindow />
    </div>
  );
};

export default ChatPage;

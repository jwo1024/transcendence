import { useState, useEffect } from "react";
import { Button, Frame, Input } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenuBox";
import { MessageInfo, UserInfo, ChatRoomInfo } from "@/types/ChatInfoType";

import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";

const friendName = "jiwolee"; /// tmp data

const ChatGroupWindow = ({
  className,
  chatRoomData,
}: {
  className?: string;
  chatRoomData: ChatRoomInfo;
}) => {
  const [messageList, setMessageList] = useState<MessageInfo[]>([]);
  const { inputRef, sentMessage, handleFormSubmit } = useMessageForm({
    chatRoomData,
  });


  useEffect(() => {
    // getMessageFrom Server .. socket io
    // console.log("ChatGroupWindow.tsx : useEffect : getMessageFrom Server");
    console.log("CHECK : ChtDmWindow : MOUNT");
    return () => {
      console.log("CHECK : ChtDmWindow : UNMOUNT");
    }
  }, []);
  console.log("CHECK : ChtDmWindow : RENDER");


  useEffect(() => {
    // set received message from server
    // socket io
    if (sentMessage?.message !== "") {
      setMessageList((messageList) => [...messageList, sentMessage]);
    }
  }, [sentMessage]);

  const menuItems: MenuItemInfo[] = [{ name: "Settings" }];

  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);

  return (
    <Window title={`DM Room | ${friendName}`} className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-row flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <MessageBox messageList={messageList} friendName={friendName} />
          </Frame>
          <form onSubmit={handleFormSubmit} className="flex flex-row p-1">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              ref={inputRef}
            />
            <Button>send</Button>
          </form>
        </div>
        {/* menu box */}
        {showMenuBox[0] ? <SettingMenuBox /> : null}
      </div>
    </Window>
  );
};

export default ChatGroupWindow;

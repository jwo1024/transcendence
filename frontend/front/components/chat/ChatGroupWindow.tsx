import { useState, useEffect } from "react"; // useCallback ?
import { Button, Frame, Input } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenuBox";
import UserListMenuBox from "./chat_window/UserListMenuBox";
import { MessageInfo, UserInfo, ChatRoomInfo } from "@/types/ChatInfoType";

import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";

// chatRoomData : chatRoomInfo // ? 빼기
const ChatGroupWindow = ({
  className,
  chatRoomData,
}: {
  className?: string;
  chatRoomData: ChatRoomInfo;
}) => {
  const [messageList, setMessageList] = useState<MessageInfo[]>([]);
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: -1,
    name: "test",
  });
  const { inputRef, sentMessage, handleFormSubmit } = useMessageForm({
    chatRoomData,
    // userInfo: userInfo,
  });

  useEffect(() => {
    console.log("CHECK : ChatGroupWindow : MOUNT");
    return () => {
      console.log("CHECK : ChatGroupWindow : UNMOUNT");
    }
  }, []);
  console.log("CHECK : ChatGroupWindow : RENDER");

  useEffect(() => {
    if (sentMessage?.message !== "") {
      // set received message from server
      // socket io
      setMessageList((messageList) => [...messageList, sentMessage]);
    }
  }, [sentMessage]);

  const menuItmes: MenuItemInfo[] = [
    { name: "Settings" },
    { name: "User-List" },
  ];

  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItmes);

  return (
    <Window title="Chatting Room | 방제" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-row flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <MessageBox messageList={messageList} />
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
        {showMenuBox[1] ? <UserListMenuBox /> : null}
      </div>
    </Window>
  );
};

export default ChatGroupWindow;

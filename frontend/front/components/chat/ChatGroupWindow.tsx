import { useState, useEffect } from "react"; // useCallback ?
import { Button, Frame, Input } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenuBox";
import UserListMenuBox from "./chat_window/UserListMenuBox";

import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";

const ChatGroupWindow = ({ className }: { className?: string }) => {
  const [message, setMessage] = useState<string[]>([]);
  const { inputRef, sentMessage, handleFormSubmit } = useMessageForm();

  useEffect(() => {
    if (sentMessage !== "") {
      setMessage((message) => [...message, sentMessage]);
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
            <MessageBox message={message} />
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

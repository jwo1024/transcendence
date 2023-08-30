import { useState, useEffect } from "react"; // useCallback ?
import { Button, Frame, Input } from "@react95/core";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenuBox";
import UserListMenuBox from "./chat_window/UserListMenuBox";

import useMessageForm from "@/hooks/useMessageForm";


const ChatGroupWindow = ({ className }: { className?: string }) => {
  const [message, setMessage] = useState<string[]>([]);
  const { inputRef, sentMessage, handleFormSubmit } = useMessageForm();

  // menu bar items
  const [showSettingMenuBox, setShowSettingMenuBox] = useState<boolean>(false);
  const [showUserListMenuBox, setshowUserListMenuBox] = useState<boolean>(false);

  useEffect (() => {
    if (sentMessage !== "") {
      setMessage((message) => [...message, sentMessage]);
    }
  }, [sentMessage]);

  const handleSettingMenuBox = () => {
    setShowSettingMenuBox((showSettingMenuBox) => !showSettingMenuBox);
    if (showUserListMenuBox) {
      setshowUserListMenuBox(false);
    }
  };

  const handleUserListMenuBox = () => {
    setshowUserListMenuBox((showUserListMenuBox) => !showUserListMenuBox);
    if (showSettingMenuBox) {
      setShowSettingMenuBox(false);
    }
  };

  const menuItems = [
    { name: "Settings", handleClick: handleSettingMenuBox },
    { name: "User-List", handleClick: handleUserListMenuBox },
  ];

  return (
    <Window title="Chatting Room | 방제" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
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
        {showSettingMenuBox ? <SettingMenuBox /> : null}
        {showUserListMenuBox ? <UserListMenuBox /> : null}
      </div>
    </Window>
  );
}

export default ChatGroupWindow;

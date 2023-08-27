import { ChangeEvent, useCallback, useState } from "react";
import { useRef } from "react";
import { Button, Frame, Input } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import ChatSettingBox from "./chat_window/ChatSettingBox";
import ChatUserListBox from "./chat_window/ChatUserListBox";

// import type { GroupRoomStatusProps } from "./types/ChatProps";

// // TMP data
// const roomStatus: GroupRoomStatusProps = {
//   id: 1,
//   chatType: "group",
//   title: "hi hello 내가 누군지 아니 ! 트센이다 트센이다 트센이다 트센이다",
//   password: true,
//   private: false,
//   numOfUser: 3,
// }; //TMP
// => message box

function ChatGroupWindow({ className }: { className?: string }) {
  const [message, setMessage] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  const handleSendMessage = useCallback(() => {
    setMessage([...message, inputRef.current?.value as string]);
    resetInputMessage();
  }, [message]);

  const handleFormSubmit = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSendMessage();
    },
    [handleSendMessage]
  );

  // menu bar items
  const [showSettingBox, setShowSettingBox] = useState<boolean>(false);
  const [showUserListBox, setshowUserListBox] = useState<boolean>(false);

  const handleSettingBoxButton = () => {
    setShowSettingBox((showSettingBox) => !showSettingBox);
    if (showUserListBox) {
      setshowUserListBox(false);
    }
  };

  const handleUserListBoxButton = () => {
    setshowUserListBox((showUserListBox) => !showUserListBox);
    if (showSettingBox) {
      setShowSettingBox(false);
    }
  };

  const menuItems = [
    { name: "Settings", handleClick: handleSettingBoxButton },
    { name: "User-List", handleClick: handleUserListBoxButton },
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
        {showSettingBox ? <ChatSettingBox /> : null}
        {showUserListBox ? <ChatUserListBox /> : null}
      </div>
    </Window>
  );
}

export default ChatGroupWindow;

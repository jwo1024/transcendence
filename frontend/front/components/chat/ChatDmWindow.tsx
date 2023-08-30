import { ChangeEvent, useCallback, useState } from "react";
import { useRef } from "react";
import { Button, Frame, Input } from "@react95/core";

import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenuBox";

/// tmp data
const friendName = "jiwolee";

const ChatGroupWindow = ({ className }: { className?: string }) => {
  const [message, setMessage] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSettingBox, setShowSettingBox] = useState<boolean>(false);

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

  const handleSettingBoxButton = () => {
    setShowSettingBox((showSettingBox) => !showSettingBox);
  };

  const menuItems = [
    { name: "Settings", handleClick: handleSettingBoxButton },
  ];

  return (
    <Window title={`DM Room | ${friendName}`} className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-row flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <MessageBox message={message} friendName={friendName} />
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
        {showSettingBox ? <SettingMenuBox /> : null}
      </div>
    </Window>
  );
}

export default ChatGroupWindow;

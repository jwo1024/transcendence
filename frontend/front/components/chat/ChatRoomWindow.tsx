import { ChangeEvent, useCallback, useState } from "react";
import { createContext } from "react";
import { Button, Input, List, Modal } from "@react95/core";

import MessageBox from "./MessageBox";
import Window from "../common/Window";
import MenuBar from "./MenuBar";
import ChatSettingBox from "./ChatSettingBox";
import ChatUserListBox from "./ChatUserListBox";

// export const ChatContext = createContext(null);

const ChatRoomWindow = () => {
  const [message, setMessage] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [showSettingBox, setShowSettingBox] = useState<boolean>(true);
  const [showUserListBox, setShowUserListBox] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  const resetInputMessage = () => {
    setInputMessage("");
  };

  const scrollDown = useCallback(() => {
    const scrollableBox = document.getElementById("scrollable-box"); // useRef 공부하기
    scrollableBox?.scrollTo(0, scrollableBox?.scrollHeight);
  }, []);

  const handleSendMessage = useCallback(() => {
    setMessage((message) => [...message, inputMessage]);
    resetInputMessage();
    scrollDown();
  }, [inputMessage, scrollDown]);

  const handleFormSubmit = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSendMessage();
    },
    [handleSendMessage]
  );

  const handleTmpButton = () => {
    setShowSettingBox((showSettingBox) => !showSettingBox);
  };

  return (
    <Window title="Chatting Room | 방제">
      {/* menu */}
      <MenuBar></MenuBar>
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <div className="flex flex-row flex-1 overflow-auto">
            <MessageBox message={message} />
          </div>
          <form onSubmit={handleFormSubmit} className="flex flex-row">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              value={inputMessage}
              onChange={handleInputChange}
            />
            <Button>send</Button>
          </form>
        </div>
        {/* setting box */}
        {/* <ChatSettingBox></ChatSettingBox> */}
        {/* friends */}
        {showSettingBox ? (
          <ChatSettingBox>
            <Button onClick={handleTmpButton}>tmp chage to UserList</Button>
          </ChatSettingBox>
        ) : (
          <ChatUserListBox>
            <Button onClick={handleTmpButton}>tmp chage to Setting</Button>
          </ChatUserListBox>
        )}
      </div>
    </Window>
  );
};

export default ChatRoomWindow;

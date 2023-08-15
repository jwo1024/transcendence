import styled from "styled-components";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, Input, List, Modal } from "@react95/core";

import MessageBox from "./MessageBox";
import Window from "../common/Window";
import MenuBar from "./MenuBar";

const ChatRoomWindow = () => {
  const [message, setMessage] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

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

  const handleOpenSettingModal = () => {
    console.log("handleOpenSettingModal");
  };

  return (
    <Window title="ChattingRoom" >
      <MenuBar></MenuBar>
      <List.Divider />
      <div className="flex flex-col w-full h-full">
        <MessageBox message={message} />
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-row h-10 min-h-fit"
        >
          <Input
            className="w-full h-full"
            placeholder="Hello, my friend !"
            value={inputMessage}
            onChange={handleInputChange}
          />
          <Button>send</Button>
        </form>
      </div>
    </Window>
  );
};

export default ChatRoomWindow;

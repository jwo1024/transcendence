import styled from "styled-components";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, Input } from "@react95/core";

import MessageBox from "./MessageBox";

const WindowLayout = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
    width: 80%;
`;

const FormWrapper = styled.form`
  display: flex;
  flex-direction: row;
  border: 1px solid black;
  height: 10%;
  width: 100%;
`;

const InputWrapper = styled(Input)`
  width: 80%;
  height: 100%;
`;

const ButtonWrapper = styled(Button)`
  width: 20%;
`;

const ChatRoomWindow = () => {
  const [message, setMessage] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  const resetInputMessage = () => {
    setInputMessage("");
  };

  const handleSendMessage = useCallback(() => {
    setMessage((message) => [...message, inputMessage]);
    resetInputMessage();
  }, [inputMessage]);

  const handleFormSubmit = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSendMessage();
    },
    [handleSendMessage]
  );

  return (
    <WindowLayout>
      <MessageBox message={message} />
      <FormWrapper onSubmit={handleFormSubmit}>
        <InputWrapper
          placeholder="message to group chat"
          value={inputMessage}
          onChange={handleInputChange}
        />
        <ButtonWrapper type="button" onClick={handleSendMessage}>
            hi
        </ButtonWrapper>
      </FormWrapper>
    </WindowLayout>
  );
};

export default ChatRoomWindow;
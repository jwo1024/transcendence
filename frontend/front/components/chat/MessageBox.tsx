import React, { FC } from "react";
import styled from "styled-components";

const BoxLayout = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  height: 90%;
  width: 100%;
  overflow: scroll;
  scroll-behavior: smooth;
`;

const NameTag = styled.span`
  color: red;
  text-color: red;
  text-decoration: bold;
`;

interface MessageBoxProps {
  message?: string[];
}

const MessageBox:FC<MessageBoxProps> = ({ message }) => {
  return (
    <BoxLayout>
      <div>message box</div>
      {message?.map((message, index) => {
        return (
          <div key={index}>
            <NameTag>name:</NameTag> {``}
            {message}
          </div>
        );
      })}
    </BoxLayout>
  );
};

export default MessageBox;
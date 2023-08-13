import React, { FC } from "react";
import styled from "styled-components";

import { Frame } from "@react95/core";

const BoxLayout = styled.div`
  id = scrollable-div;
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
// id

const MessageBox: FC<MessageBoxProps> = ({ message }) => {
  return (
    <Frame
      // id={id}
      className="flex flex-col border border-black h-full w-full overflow-y-scroll scroll-behavior-smooth"
      h="100%" boxShadow="in" bg="white"
    >
      {/* <Frame className="h-full" boxShadow="in" bg="white"> */}
        <div>message box</div>
        {message?.map((message, index) => {
          return (
            <div key={index}>
              <NameTag>name:</NameTag> {``}
              {message}
            </div>
          );
        })}
      {/* </Frame> */}
    </Frame>
  );
};

export default MessageBox;

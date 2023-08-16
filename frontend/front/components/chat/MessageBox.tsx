import React, { FC } from "react";
import styled from "styled-components";

import { Frame } from "@react95/core";
import NameTag from "./NameTag";

interface MessageBoxProps {
  message?: string[];
}
// id

const ChatRoomStatus: FC = () => {
  return (
    <div className="p-3">
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">방제</span>
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">공개방</span>
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">비밀번호 없음</span>
    </div>
  );
};

const MessageBox: FC<MessageBoxProps> = ({ message }) => {
  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll scroll-behavior-smooth p-2"
      h=""
      boxShadow="in"
      bg="white"
    >
      {/* <Frame className="h-full" boxShadow="in" bg="white"> */}
      <ChatRoomStatus/>
      {message?.map((message, index) => {
        return (
          // message overflow 처리하기
          <div className=" bg-stone-300 m-0.5 rounded" key={index}>
            <NameTag>name</NameTag> {``}
            <span className="">{message}</span>
            <span className="text-sm m-1 text-zinc-100 ml-2">
              22.22.22 22:22:22
            </span>
          </div>
        );
      })}
      {/* </Frame> */}
    </Frame>
  );
};

export default MessageBox;

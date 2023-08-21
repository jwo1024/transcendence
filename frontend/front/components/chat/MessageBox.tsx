import React, { FC, useRef, useEffect } from "react";
import styled from "styled-components";

import { Frame } from "@react95/core";
import NameTag from "./NameTag";

interface MessageBoxProps {
  message?: string[];
  ref?: React.RefObject<HTMLDivElement>;
}
// id

const WhiteInnerFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <Frame className=" flex-1 text-sm" h="100%" boxShadow="in" bg="white">
      {children}
    </Frame>
  );
};

const ChatRoomStatus: FC = () => {
  return (
    // <Frame className="flex flex-raw p-3 text-center" h="" w="100%" padding={3}>
    //   <WhiteInnerFrame>방제</WhiteInnerFrame>
    //   <WhiteInnerFrame>공개방</WhiteInnerFrame>
    //   <WhiteInnerFrame>비밀번호 없음</WhiteInnerFrame>
    //   <WhiteInnerFrame> 메모</WhiteInnerFrame>
    // </Frame>
    <div className="p-3">
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">방제</span>
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">공개방</span>
      <span className="mx-1 my-2 bg-stone-200 p-1 rounded">비밀번호 없음</span>
    </div>
  );
};

const MessageBox: FC<MessageBoxProps> = ({ message, ref }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [message]);

  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll p-2"
      h=""
      boxShadow="in"
      bg="white"
    >
      <ChatRoomStatus />
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
      <div ref={scrollRef}/>
    </Frame>
  );
};

export default MessageBox;

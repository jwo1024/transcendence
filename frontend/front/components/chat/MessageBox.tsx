import React, { FC, useRef, useEffect } from "react";

import { Frame } from "@react95/core";
import NameTag from "./NameTag";

interface MessageBoxProps {
  message?: string[];
  userName?: string[];
  time?: string[];
}

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

const MessageBox: FC<MessageBoxProps> = ({ message }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll p-2 "
      h=""
      boxShadow="in"
      bg="white"
    >
      <ChatRoomStatus />
      {message?.map((message, index) => {
        return (
          // message overflow 처리하기
          <div
            className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis "
            key={index}
          >
            <NameTag>name</NameTag>
            <span className="text-ellipsis break-all ">{message}</span>
            <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
              22.22.22 22:22:22
            </span>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </Frame>
  );
};

export default MessageBox;

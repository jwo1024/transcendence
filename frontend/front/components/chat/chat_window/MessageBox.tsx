// Libraries
import React, { useRef, useEffect } from "react";
import { Frame } from "@react95/core";
// Components
import NameTag from "../common/NameTag";
// Types & Hooks & Contexts
import type { MessageDTO, MessageI, SimpUserI } from "@/types/ChatInfoType";

interface MessageBoxProps {
  messageList?: MessageI[];
  sentMessage?: MessageDTO;
  userInfo: SimpUserI;
}

const MessageBox = ({
  messageList,
  sentMessage,
  userInfo,
}: MessageBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll p-2 "
      h=""
      boxShadow="in"
      bg="white"
    >
      {messageList?.map((messageInfo, index) => {
        return (
          // message overflow 처리하기
          <div
            className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis "
            key={index}
          >
            <NameTag>{messageInfo.user.nickname}</NameTag>
            <span className="text-ellipsis break-all ">{messageInfo.text}</span>
            <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
              {messageInfo.created_at.toLocaleString()}
            </span>
          </div>
        );
      })}
      {sentMessage ? (
        <div className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis ">
          <NameTag>{userInfo.nickname}</NameTag>
          <span className="text-ellipsis break-all ">{sentMessage.text}</span>
          <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
            {"Sending..."}
          </span>
        </div>
      ) : null}
      <div ref={scrollRef} />
    </Frame>
  );
};

export default MessageBox;

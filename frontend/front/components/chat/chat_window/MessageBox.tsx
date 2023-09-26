// Libraries
import React, { useRef, useEffect } from "react";
import { Frame } from "@react95/core";
// Components
import NameTag from "../common/NameTag";
// Types & Hooks & Contexts
import type {
  SendMessageDTO,
  RecvMessageDTO,
  SimpUserI,
} from "@/types/ChatInfoType";

interface MessageBoxProps {
  messageList: RecvMessageDTO[];
  // sentMessage?: MessageDTO;
  userInfo: SimpUserI;
  sentMsgList: SendMessageDTO[];
  blockIdList: number[];
}

const MessageBox = ({
  messageList,
  userInfo,
  sentMsgList,
  blockIdList,
}: MessageBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, sentMsgList]);

  const formatDateTime = (date: Date) => {
    const obj = new Date(date);
    const year = obj.getFullYear();
    const month = obj.getMonth();
    const day = obj.getDate();
    const hours = obj.getHours();
    const minutes = obj.getMinutes();
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll p-2 "
      h=""
      boxShadow="in"
      bg="white"
    >
      {messageList.map((messageInfo, index) => {
        if (messageInfo.user.id && blockIdList.includes(messageInfo.user.id))
          return (
            <div
              className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis "
              key={index}
            >
              <span className="text-ellipsis break-all ">
                {"🙉block user send message🙉"}
              </span>
              <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
                {formatDateTime(messageInfo.created_at)}
              </span>
            </div>
          );
        return (
          // message overflow 처리하기
          <div
            className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis "
            key={index}
          >
            {!messageInfo.user.id ? null : (
              <NameTag>{messageInfo.user?.nickname}</NameTag>
            )}
            <span className="text-ellipsis break-all ">{messageInfo.text}</span>
            <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
              {formatDateTime(messageInfo.created_at)}
            </span>
          </div>
        );
      })}
      {sentMsgList.map((messageInfo, index) => {
        return (
          <div
            className=" bg-stone-300 m-0.5 pl-1 rounded text-ellipsis "
            key={index}
          >
            <NameTag>{userInfo.nickname}</NameTag>
            <span className="text-ellipsis break-all ">{messageInfo.text}</span>
            <span className="text-sm m-1 text-zinc-100 ml-2 text-ellipsis break-all">
              {"Sending..."}
            </span>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </Frame>
  );
};

export default MessageBox;

import React, { useRef, useEffect } from "react";

import { Frame } from "@react95/core";
import NameTag from "../common/NameTag";

interface StatusBlockProps {
  status?: string[];
}

interface MessageBoxProps {
  message?: string[];
  friendName?: string;
}

const StatusBlock = ({ children }: { children: React.ReactNode }) => (
  <span className="mx-1 my-2 bg-stone-200 p-1 rounded">{children}</span>
);

const StatusBlockList = ({ status }: StatusBlockProps) => {
  return (
    <div className="p-3">
      {status?.map((status, index) => {
        return <StatusBlock key={index}>{status}</StatusBlock>;
      })}
    </div>
  );
};

const MessageBox = ({ message, friendName }: MessageBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [roomStatus, setRoomStatus] = React.useState<string[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    {
      friendName
        ? setRoomStatus([friendName + "와 Private 한 DM방"])
        : setRoomStatus(["방제", "비밀번호 있음", "인원 [3명]"]);
    }
  }, []);


  return (
    <Frame
      className="flex flex-col flex-1 overflow-y-scroll p-2 "
      h=""
      boxShadow="in"
      bg="white"
    >
      <StatusBlockList status={roomStatus} />
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

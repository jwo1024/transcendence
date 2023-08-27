import React, { useEffect, useState } from "react";

import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";

import { Button } from "@react95/core";

const ChatPage = () => {
  const [chatGroup, setChatGroup] = useState<boolean>(true);
  const [waitingRoom, setWaitingRoom] = useState<boolean>(false);
  const [chatDM, setChatDM] = useState<boolean>(false); /// 교체 및 삭제 필요

  const showChatGroupButton = () => {
    setChatGroup((chatGroup) => !chatGroup);
    {
      // const fetchComments = async () => {
      //   const res = await fetch("http://localhost:3000/api/user");
      //   if (res.ok) {
      //     const data = await res.json();
      //     console.log(data);
      //     data.map((user : any) => {
      //       console.log(user);
      //     }
      //     );
      //   }
      //   else
      //     console.log("A error");
      // };
      // fetchComments();
    }
  };

  const showWaitingRoomButton = () => {
    setWaitingRoom((waitingRoom) => !waitingRoom);
  };

  const showChatDMButton = () => {
    setChatDM((chatDM) => !chatDM);
  };

  // screen resize
  const [felxRow, setFelxRow] = useState<boolean>(true);

  const handleResize = () => {
    setFelxRow(window.innerWidth > window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="m-2 max-w-screen ">
      <div
        className={felxRow ? "flex flex-row h-90vh" : "flex flex-col h-90vh"}
      >
        {chatGroup ? <ChatGroupWindow /> : null}
        {waitingRoom ? <WaitingRoomWindow /> : null}
        {chatDM ? <ChatDmWindow /> : null}
      </div>
      <Button className="m-1" onClick={showChatGroupButton}>
        tmp chat room
      </Button>
      <Button className="m-1" onClick={showWaitingRoomButton}>
        tmp waiting room
      </Button>
      <Button className="m-1" onClick={showChatDMButton}>
        tmp DM room
      </Button>
    </div>
  );
};

export default ChatPage;

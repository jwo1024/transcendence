import React, { useEffect, useState } from "react";

import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";
import { Socket, io } from "socket.io-client";

// const socket = io('http://localhost:4000'); //네임스페이스 사용 안 할 시
const socket = io('http://localhost:4000/chat'); //네임스페이스 사용시 url 추가

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
}

export default ChatPage;

///-----------------------------------------------------original


// import React, { ReactNode, useState } from "react";
// import styled from "styled-components";

// import ChatRoomWindow from "@/components/chat/ChatRoomWindow";
// import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
// import ChatDmWindow from "@/components/chat/ChatDmWindow";
// // import ChatSettingWindow from "@/components/chat/ChatSettingWindow";

// import { Button } from "@react95/core";

// interface ChatProps {
//   children?: ReactNode;
// }

// const ChatPageLayout = styled.div`
//   display: flex;
//   flex-direction: column;
//   border: 1px solid black;
//   height: 90vh;
//   width: 100%;
// `;

// const ChatPage = ({ children }: ChatProps) => {
//   const [chatRoom, setChatRoom] = useState<boolean>(true);
//   const [waitingRoom, setWaitingRoom] = useState<boolean>(false); 
//   const [DMRoom, setDMRoom] = useState<boolean>(false); /// 교체 및 삭제 필요

//   const showChatRoomButton = () => {
//     setWaitingRoom((waitingRoom) => !waitingRoom);
//     setChatRoom(false);
//     setDMRoom(false);
//   };

//   const showWaitingRoomButton = () => {
//     setChatRoom((chatRoom) => !chatRoom);
//     setWaitingRoom(false);
//     setDMRoom(false);
//   };

//   const showDMRoomButton = () => {
//     setDMRoom((DMRoom) => !DMRoom);
//     setChatRoom(false);
//     setWaitingRoom(false);
//   };

//   return (
//     <div className="m-2">
//       <div className="flex flex-row  h-90vh ">
//         {chatRoom ? <ChatRoomWindow /> : null}
//         {waitingRoom ? <WaitingRoomWindow /> : null}
//         {DMRoom ? <ChatDmWindow /> : null}
//       </div>
//       <Button className="m-1" onClick={showChatRoomButton}>
//         tmp chat room
//       </Button>
//       <Button className="m-1" onClick={showWaitingRoomButton}>
//         tmp waiting room
//       </Button>
//       <Button className="m-1" onClick={showDMRoomButton}>
//         tmp DM room
//       </Button>
//     </div>
//   );
// };

// export default ChatPage;

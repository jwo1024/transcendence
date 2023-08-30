// frontend/src/pages/chat/index.js

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// const socket = io('http://localhost:4000'); //네임스페이스 사용 안 할 시
const socket = io('http://localhost:4000/chat'); //네임스페이스 사용시 url 추가

// const socket = io('http://backend-dev:3000'); //nono
// const socket = io('http://172.25.0.4:3000'); //nono

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    console.log('Sending message:', messageInput);
    socket.emit('chatMessage', messageInput);
    setMessageInput('');
  };

  useEffect(() => {
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
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

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


// import React, { useState, useEffect } from 'react';
// import socket from '../../socket'; // socket.js 파일을 import합니다.

// const socket = io.connect('http://localhost:3000'); // 백엔드 서버의 주소로 변경


// function Home() {
//   const [messages, setMessages] = useState([]); // 채팅 메시지를 상태로 관리합니다.
//   const [messageInput, setMessageInput] = useState(''); // 입력된 메시지를 상태로 관리합니다.

//   useEffect(() => {
//     // 컴포넌트가 마운트되었을 때 소켓 이벤트 리스너를 등록합니다.
//     socket.on('chatMessage', (message) => {
//       // 'chatMessage' 이벤트가 수신되면 새 메시지를 상태에 추가합니다.
//       setMessages([...messages, message]);
//     });

//     return () => {
//       // 컴포넌트가 언마운트되기 전에 소켓 연결을 끊습니다.
//       socket.disconnect();
//     };
//   }, [messages]);

//   const sendMessage = () => {
//     // 'Send' 버튼 클릭 시 호출되는 함수로 소켓을 통해 메시지를 보냅니다.
//     console.log('Sending message:', messageInput);
//     socket.emit('chatMessage', messageInput); // 'chatMessage' 이벤트와 입력된 메시지를 전송합니다.
//     setMessageInput(''); // 입력 필드를 초기화합니다.
//   };

//   return (
//     <div>
//       <div>
//         {messages.map((message, index) => (
//           <div key={index}>{message}</div> // 상태에 저장된 메시지들을 출력합니다.
//         ))}
//       </div>
//       <input
//         type="text"
//         value={messageInput}
//         onChange={(e) => setMessageInput(e.target.value)} // 입력 필드의 값을 상태에 반영합니다.
//       />
//       <button onClick={sendMessage}>Send</button> // 'Send' 버튼을 클릭하면 sendMessage 함수가 호출됩니다.
//     </div>
//   );
// }

// export default Home;
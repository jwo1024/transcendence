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


// const io = require('socket.io-client');

// // Socket.IO 서버의 URL 설정
// const serverUrl = 'http://your-socket-io-server-url';

// // 원하는 파라미터 설정
// const params = {
//   roomName: "Surlee's Room",
//   roomType: 'open',
// };

// // Socket.IO 클라이언트 생성
// const socket = io.connect(serverUrl, {
//   query: params, // 파라미터 전송
// });

// // Socket.IO 이벤트 처리
// socket.on('connect', () => {
//   console.log('Socket.IO connected');
// });

// socket.on('message', (data) => {
//   console.log('Received message:', data);
// });

// socket.on('disconnect', () => {
//   console.log('Socket.IO disconnected');
// });
// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// // const socket = io('http://localhost:4000'); //네임스페이스 사용 안 할 시
// const socket = io('http://localhost:4000/chat'); //네임스페이스 사용시 url 추가

// // const socket = io('http://backend-dev:3000'); //nono
// // const socket = io('http://172.25.0.4:3000'); //nono
// //------------------------------------
// export type roomType = 'open' | 'protected' | 'private' | 'dm';

// export class RoomCreateDTO {

//   roomName: string;

//   roomType: roomType;

//   roomPass?: string;
// }


// //------------------------------------

// function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');

//   const handleSendMessage = () => {
// 	console.log('Sending message:', messageInput);
//     const room:RoomCreateDTO = { 
//       roomName: messageInput,
//       roomType: "open",
//     }
// 	socket.emit('Room-create',room);
// 	setMessageInput('');
//   };

  
//   socket.on('rooms', (room)=>{
//     console.log('created room: ', room);
//   } );


//   // useEffect(() => {
//   // socket.on('message', (message) => {
//   //   setMessages((prevMessages) => [...prevMessages, message]);
//   // });
//   // }, []);

//   // join room
//   const addJoinRoomList = () => {
//     // get data from sever
//     const roomData: ChatRoomInfo = {
//       id: 10,
//       chatType: "group",
//       title: "test",
//       isPublic: true,
//       password: false,
//       numOfUser: 1,
//     }; // tmp data
//     addState({ roomData });
//     // addState(newJoinRoom);
//   };

//   const deleteJoinRoomList = () => {
//     const roomId = 10;
//     removeState({ roomId });
//   };

//   // TODO : useChatRoomListReducer.tsx 로 관리하기
//   const getJoinRoomInfo = (id: number) => {
//     const joinRoomList: ChatRoomInfo = {
//       id: -1,
//       chatType: "group",
//       title: "test",
//       isPublic: true,
//       password: false,
//       numOfUser: 1,
//     }; // tmp data
//     const target = state.list.find((room: ChatRoomInfo) => room.id === id);
//     return target ? target : joinRoomList;
//   };

//   return (
// <!-- <<<<<<< feat/make_chat_room_methods_#46
// 	<div>
// 	  <div>
// 		{messages.map((msg, index) => (
// 		  <div key={index}>{msg}</div>
// 		))}
// 	  </div>
// 	  <div>
// 		<input
// 		  type="text"
// 		  value={messageInput}
// 		  onChange={(e) => setMessageInput(e.target.value)}
// 		/>
// 		<button onClick={handleSendMessage}>Send</button>
// 	  </div>
// 	</div>
// ======= -->
//     <div className="m-2 max-w-screen ">
//       <div
//         className={felxRow ? "flex flex-row h-90vh" : "flex flex-col h-90vh"}
//       >
//         {/* TODO : set ChatRoomInfo and show window */}
//         {/*
//           for waiting room data
//           joinRoomList : ChatRoomInfo[];

//           뭔가 순서대로 정보를 가지고 있다가 3개의 창만 보여줬으면 하는데...
//         */}
//         {waitingRoom ? <WaitingRoomWindow /> : null}
//         {chatGroup ? (
//           <ChatGroupWindow chatRoomData={getJoinRoomInfo(1)} />
//         ) : null}
//         {chatDM ? <ChatDmWindow chatRoomData={getJoinRoomInfo(2)} /> : null}
//       </div>
//       <Button className="m-1" onClick={showChatGroupButton}>
//         tmp chat room
//       </Button>
//       <Button className="m-1" onClick={showWaitingRoomButton}>
//         tmp waiting room
//       </Button>
//       <Button className="m-1" onClick={showChatDMButton}>
//         tmp DM room
//       </Button>
//     </div>
// // >>>>>>> main
//   );
// }

// export default ChatPage;

//     // import React, { useEffect, useState } from "react";

//     // import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
//     // import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
//     // import ChatDmWindow from "@/components/chat/ChatDmWindow";

//     // import { Button } from "@react95/core";

//     // const ChatPage = () => {
//     //   const [chatGroup, setChatGroup] = useState<boolean>(true);
//     //   const [waitingRoom, setWaitingRoom] = useState<boolean>(false);
//     //   const [chatDM, setChatDM] = useState<boolean>(false); /// 교체 및 삭제 필요

//     //   const showChatGroupButton = () => {
//     //     setChatGroup((chatGroup) => !chatGroup);
//     //     {
//     //       // const fetchComments = async () => {
//     //       //   const res = await fetch("http://localhost:3000/api/user");
//     //       //   if (res.ok) {
//     //       //     const data = await res.json();
//     //       //     console.log(data);
//     //       //     data.map((user : any) => {
//     //       //       console.log(user);
//     //       //     }
//     //       //     );
//     //       //   }
//     //       //   else
//     //       //     console.log("A error");
//     //       // };
//     //       // fetchComments();
//     //     }
//     //   };

//     //   const showWaitingRoomButton = () => {
//     //     setWaitingRoom((waitingRoom) => !waitingRoom);
//     //   };

//     //   const showChatDMButton = () => {
//     //     setChatDM((chatDM) => !chatDM);
//     //   };

//     //   // screen resize
//     //   const [felxRow, setFelxRow] = useState<boolean>(true);

//     //   const handleResize = () => {
//     //     setFelxRow(window.innerWidth > window.innerHeight);
//     //   };

//     //   useEffect(() => {
//     //     window.addEventListener("resize", handleResize);
//     //     return () => window.removeEventListener("resize", handleResize);
//     //   }, []);

//     //   return (
//     //     <div className="m-2 max-w-screen ">
//     //       <div
//     //         className={felxRow ? "flex flex-row h-90vh" : "flex flex-col h-90vh"}
//     //       >
//     //         {chatGroup ? <ChatGroupWindow /> : null}
//     //         {waitingRoom ? <WaitingRoomWindow /> : null}
//     //         {chatDM ? <ChatDmWindow /> : null}
//     //       </div>
//     //       <Button className="m-1" onClick={showChatGroupButton}>
//     //         tmp chat room
//     //       </Button>
//     //       <Button className="m-1" onClick={showWaitingRoomButton}>
//     //         tmp waiting room
//     //       </Button>
//     //       <Button className="m-1" onClick={showChatDMButton}>
//     //         tmp DM room
//     //       </Button>
//     //     </div>
//     //   );
//     // };


// // 클릭을한다 => 서버에 여기에 들어가고싶어요를 요청한다
// // 그다음에 join 에 성공한다면 joinlist 에 등록을 한다. => 창을 띄운다.

// // 이미 조인이 되어있다면 => 그냥 들어간다.
// // 아마도

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

// entity or dto?

// 내 프로필, 상대 프로필
// ongoing score
// game mode: 래더, 오리지널, 커스텀(종류, 속도)
interface GameInfo
{
	gameId,
	playerLeft,
	playerRight,
	gameMode,
	gameType,
	scoreLeft: number,
	scoreRight: number,
}

// 퐁 캔버스, 플레이어 2명의 bar, 퐁 ball
interface GameField
{
	// canvas
	canvasLeft: number,
	canvasRight: number,
	canvasUp: number,
	canvasBottom: number,
	barLeftY: number,
	barRightY: number,
	ballX: number,
	ballY: number,
}

// chat 소켓과의 관계:
// 채팅방의 소켓을 그대로 가져와서 쓰기 or 게임 소켓 새로 만들기..?

async function startGame()
{
	// game mode 확인, 설정
	// GameInfo, Gamefield 값 설정
	// 
}

function queueProcess(socket: Socket)
{
	console.log("============ ladderGameQueue: queueProcess ================");
	const queueRoom = "queueRoom";
	socket.join(queueRoom);
	console.log(socket.id);
	console.log(socket.rooms);
	// const room_name = "1"; // somethig like user.id
	// socket.join(room_name);
	// queue process logic
	// if (이미 큐 대기 중인 사람 중에서 맞는 상대를 찾는다면)
	// socket.join(/*opponent_room_name*/);
	startGame();
	// 대결 상대를 찾지 못한 채 특정 시간 이상이 지나도 null 반환
	return null;
}

@Injectable()
@WebSocketGateway({ namespace: 'game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
	// private logger = new Logger('GameGateway');
	// this.logger.log();

	async onModuleInit() {}
	async handleConnection(socket: Socket) // handleconnection 함수를 오버라이딩해서 사용
	{
		console.log("Server: connected.");
	}
	async handleDisconnect(socket: Socket)
	{
		console.log("Server: disconnected.");
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	

	@SubscribeMessage('ladderGameQueue') // ladder game 큐 시도
	handleEvent(@ConnectedSocket() socket: Socket, @MessageBody() data)
	{
		// 인가? user id?
		console.log("log: ladder game queue start.");

		
		console.log("============ ladderGameQueue: handleEvent ================");
		console.log("socket.id : " + socket.id);
		console.log(socket.rooms);
		console.log(socket.data);
		console.log(data);
		
		const opponent = queueProcess(socket);
		if (opponent === null)
		{
			console.log("============ ladderGameQueue: handleEvent: if() ================");
			console.log("no game now.");
			socket.emit('noLadderGame');
		}
		const clients = this.server.in("queueRoom").fetchSockets();
		console.log(clients);
	}
}









// temp --------------------
// import MiniProfile from "@/components/game/MiniProfile";
// import React from "react";
// import { ThemeProvider } from "@react95/core";
// import Window from "@/components/common/Window";

// import io from 'socket.io-client';
// const socket = io('http://localhost:4000/game'); 

// export default function GamePage() {

//   const testHandler = () => {
//     console.log("front: game/index.tsx");
//     console.log("============ socket ================");
// 		console.log("socket.id : " + socket.id);
//     socket.emit('ladderGameQueue');
//   };

//   socket.on('noLadderGame', () => {
//     console.log("Oh, there's no ladder game now..");
//   });


//   return (
//     <div className="flex items-center justify-center h-screen">
//       <Window title="pong game" w="900" h="850">
//         <div className="h-screen flex flex-col justify-center items-center">
//           <div className="bg-black w-[800px] h-[600px]"></div>
//           <button onClick={testHandler}>WANT LADDER GAME</button>
//           <div className="flex mt-10 w-[800px] items-center justify-between">
//             <MiniProfile
//               nickname="JohnDoe"
//               ladder={2134}
//               win={23}
//               lose={17}
//               avatarSrc="https://github.com/React95.png"
//             />
//             <img className="h-40 mx-10" src="versus.png" />
//             <MiniProfile
//               nickname="JohnDoe"
//               ladder={2134}
//               win={23}
//               lose={17}
//               avatarSrc="https://github.com/React95.png"
//             />
//           </div>
//         </div>
//       </Window>
//     </div>
//   );
// }

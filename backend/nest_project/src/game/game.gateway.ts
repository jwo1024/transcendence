import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

// entity or dto?

// 내 프로필, 상대 프로필
// ongoing score
// game type: 래더, 오리지널, 커스텀(종류, 속도)
interface GameInfo
{
	matchId: number, // database 관리? or 서버 코드 내에서 임시 변수로 관리? // 데이터베이스에는 serial match_id
	roomName: string,
	playerLeft: string,
	playerRight: string,
	gameType: string,
	customType:string,
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
	paddleLeftY: number,
	paddleRightY: number,
	ballX: number,
	ballY: number,
}

async function startGame() // setGame()
{
	// game mode 확인, 설정
	// GameInfo, Gamefield 값 설정
	// 
}

// 래더 큐 잡는 로직
async function queueProcess()
{
	console.log("============ ladderGameQueue: queueProcess ================");
	// ladderQueue[] 안에서 검색
	// const room_name = "1"; // user.id? unique something
	// socket.join(room_name);
	// queue process logic
	// if (이미 큐 대기 중인 사람 중에서 맞는 상대를 찾는다면)
	// socket.join(/*opponent_room_name*/);
	startGame();
	// 대결 상대를 찾지 못한 채 특정 시간 이상이 지나도 null 반환
	return null;
}

async function joinGameRoom(playerLeft: Socket, playerRight: Socket)
{
	// matchId 기록
	playerLeft.join("game room"/* matchId */);
	playerRight.join("game room"/* matchId */);
}


const playerList: string[] = [];

@Injectable()
@WebSocketGateway({ namespace: 'game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
	private logger = new Logger('GameGateway');
	// this.logger.log();

	// variables
	private ladderQueue: Socket[];

	// constructor
	constructor()
	{
		this.ladderQueue = [];
	}

	// 서버 초기화 필요?

	// 게임 기다리기 (래더 큐 / 친구 신청)
		// 래더 큐 프로세스
		// 친구에게 게임 신청하고 대기 (게임 타입 결정)
		// 친구로부터 게임 신청 받고 승낙/거절
	// 게임 설정하는 함수(게임 모드, 타입, 게임info 와 게임field 값 설정)
	// 게임방을 만들고 두 플레이어를 조인
	// 게임 시작!
	// 두 클라이언트에게 데이터 받고 서버에서 양쪽에 일괄 전송
	// 각 소켓, 각 방에 대한 정보 출력 (디버깅 목적)


	async onModuleInit() {}
	// 연결, 끊길 시 -> secket id 리뉴얼하기
	async handleConnection(socket: Socket) // handleconnection 함수를 오버라이딩해서 사용
	{
		console.log("Server: connected.");
		// user의 소켓 id 정보
	}
	async handleDisconnect(socket: Socket)
	{
		console.log("Server: disconnected.");
		// 유저의 소켓 id 삭제?
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	@SubscribeMessage('waitGame')
	async waitGame(@ConnectedSocket() socket: Socket, @MessageBody() data)
	{
		console.log("waitGame funtion start!");
		const roomName = "Game Room";
		playerList.push(socket.id);
		console.log(`${socket.id} is added to playerList.`);
		socket.join(roomName);
		console.log(socket.rooms);
		console.log(playerList);

		if (playerList.length === 2)
		{
			console.log("Two player here now.");
			console.log(socket.id);
			console.log(socket.rooms);
			console.log(playerList);
		}
	}

	@SubscribeMessage('playGame')
	async playGame(@ConnectedSocket() socket: Socket, @MessageBody() data)
	{
		const gameInfo: GameInfo =
		{
			matchId: 0,
			roomName: "Game Room",
			playerLeft: playerList[0],
			playerRight: playerList[1],
			gameType: "original",
			customType: "default",
			scoreLeft: 0,
			scoreRight: 0,
		};

		// 특정 rooms에게만 이벤트 발생
		if (socket.id === gameInfo.playerLeft) // left side
		{
			// socket.on();
		}
		else // right side
		{}
	}

	@SubscribeMessage('ladderGameQueue')
	ladderQueueMatch(@ConnectedSocket() socket: Socket)
	{
		// 인가? user id?
		this.ladderQueue.push(socket);

		// console.log(socket.id);
		// console.log(socket.rooms);
		// console.log(socket.data);
		// console.log(data);
		
		const opponent = queueProcess();
		if (opponent === null)
		{
			console.log("no game now.");
			socket.emit('noLadderGame');
		}
		// const clients = this.server.in("queueRoom").fetchSockets();
		// console.log(clients);
	}

	@SubscribeMessage('inviteGame')
	inviteGameQueue(@ConnectedSocket() socket: Socket, @MessageBody() oppponent)
	{
		// login 확인
		// set game
		// invinte opponent user
		joinGameRoom(socket, socket/* opponent's socket */);
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

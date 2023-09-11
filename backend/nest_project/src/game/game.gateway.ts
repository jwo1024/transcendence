import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Player, MatchInfo, GameField } from './interface/game.interface';
import { PlayerEntity } from './entities/player.entity';
import { GameService } from './game.service';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

/////////////////////// typeorm config 설정하기!!!!!!!!!!
/////////////////////// front socket io 설정하기!!!!!!!!!


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
	// startGame();
	// 대결 상대를 찾지 못한 채 특정 시간 이상이 지나도 null 반환
	return null;
}

async function joinGameRoom(playerLeft: Socket, playerRight: Socket)
{
	// matchId 기록
	playerLeft.join("game room"/* matchId */);
	playerRight.join("game room"/* matchId */);
}

// const playerList: string[] = [];

// async function tempSetPlayers(id: number)
// {
// 	const player: Player = await this.gameService.tempCreatePlayer(id);
// 	return player;
// }
// //temp
// const player1 = tempSetPlayers(0);
// const player2 = tempSetPlayers(1);

const player1: Player = {
			id: 0,
			level: 42,
			nickname: "even player",
			socketId: "not yet",
		};
const player2: Player = {
			id: 1,
			level: 42,
			nickname: "odd player",
			socketId: "not yet",
		};

const gamefield: GameField = {
	paddleLeftY: 42,
	paddleRightY: 42,
	ballX: 0,
	ballY: 0
}

@Injectable()
@WebSocketGateway({ namespace: 'game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
	private logger = new Logger('GameGateway');
	// this.logger.log();

	// variables
	private ladderQueue: Socket[];

	// constructor
	constructor(
		private gameService: GameService,
	)
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

		// const player: Player = await this.gameService.createPlayer(socket.id);
		// console.log(player);

		if (player1.socketId === "not yet")
		{
			player1.socketId = socket.id;
			console.log(player1);
		}
		else if (player2.socketId === "not yet")
		{
			player2.socketId = socket.id;
			console.log(player2);
		}
	}
	async handleDisconnect(socket: Socket)
	{
		console.log("Server: disconnected.");
		// 유저의 소켓 id 삭제?
		// await this.gameService.deletePlayerBySocketId(socket.id);
		if (player1.socketId === socket.id)
		{
			player1.socketId = "not yet";
		}
		if (player2.socketId === socket.id)
		{
			player2.socketId = "not yet";
		}
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	@SubscribeMessage('waitGame')
	async waitGame(@ConnectedSocket() socket: Socket)
	{
		console.log("waitGame funtion start!");
		// const roomName = "Game Room";
		// playerList.push(socket.id);
		// console.log(`${socket.id} is added to playerList.`);
		// socket.join(roomName);
		// console.log(socket.rooms);
		// console.log(playerList);

		// if (playerList.length === 2)
		// {
		// 	console.log("Two player here now.");
		// 	console.log(socket.id);
		// 	console.log(socket.rooms);
		// 	console.log(playerList);
		// }
	}

	@SubscribeMessage('startGame')
	async startGame(@ConnectedSocket() socket: Socket)
	{
		// game mode 확인, 설정
		// MatchInfo, Gamefield 값 설정
		
		// setGame();
		// const playerLeft: Player = await this.gameService.getPlayerBynickname("odd player");
		// const playerRight: Player = await this.gameService.getPlayerBynickname("even player");
		const playerLeft: Player = player1;
		const playerRight: Player = player2;
		console.log("start Game ::");
		console.log(playerLeft);
		console.log(playerRight);
		const matchInfo: MatchInfo =
		{
			matchId: 42, // dataBase 연동
			// matchTime: Date.now(),
			roomName: "Game Room", // unique
			playerLeft: playerLeft,
			playerRight: playerRight,
			gameType: "original", //
			customMode: "default", //
			scoreLeft: 0,
			scoreRight: 0,
		};
		// const gameField: GameField = {};

		socket.join(matchInfo.roomName);
		
		socket.emit('setMiniProfile', playerLeft, playerRight, () => {
			console.log("sending mini profile data OK.");
		});

		// 특정 room에게만 이벤트 발생
		// playGame();
	}

	@SubscribeMessage('mouseMove')
	async playerMove(@ConnectedSocket() socket: Socket, @MessageBody() userY: number)
	{
		// console.log("mouse Move Function ::");
		// console.log(userY);
		// return "";
		if (socket.id === player1.socketId)
		{
			gamefield.paddleLeftY = userY;
			socket.to("Game Room").emit('paddleMove', gamefield);
			// return gamefield;
		}
		else if (socket.id === player2.socketId)
		{
			gamefield.paddleRightY = userY;
			socket.to("Game Room").emit('paddleMove', gamefield);
			// return gamefield;
		}
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

	// @SubscribeMessage('inviteGame')
	// inviteGameQueue(@ConnectedSocket() socket: Socket, @MessageBody() oppponent)
	// {
	// 	// login 확인
	// 	// set game
	// 	// invinte opponent user
	// 	joinGameRoom(socket, socket/* opponent's socket */);
	// }

}






// temp --------------------
// import React from "react";
// import { ThemeProvider } from "@react95/core";
// import Window from "@/components/common/Window";
// import MiniProfile from "@/components/game/MiniProfile";
// import PongGame from "@/components/game/PongGame";

// import io from 'socket.io-client';
// const socket = io('http://localhost:4000/game'); 

// const left = { nickname: "pLeft.nickname", ladder: 0, };
// const right = { nickname: "pRight.nickname", ladder: 0, };

//   const startGameHandler = () => {
//     socket.emit('startGame');
//     socket.on('setMiniProfile', (pLeft, pRight, callback) => {
//       left.nickname = pLeft.nickname;
//       left.ladder = pLeft.level;
//       right.nickname = pRight.nickname;
//       right.ladder = pRight.level;
//       callback();
//     });
//   };

// export default function GamePage() {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <button onClick={startGameHandler}>START GAME</button>
//       <Window title="pong game" w="900" h="850">
//         <div className="h-screen flex flex-col justify-center items-center">
//           <PongGame />
//           <div className="flex mt-10 w-[800px] items-center justify-between">
//             <MiniProfile
//               nickname={left.nickname}
//               ladder={left.ladder}
//               win={23}
//               lose={17}
//               avatarSrc="https://github.com/React95.png"
//             />
//             <img className="h-40 mx-10" src="versus.png" />
//             <MiniProfile
//               nickname={right.nickname}
//               ladder={right.ladder}
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
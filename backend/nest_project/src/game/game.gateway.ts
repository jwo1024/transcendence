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
	console.log("log: queueProcess function start.");
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
	private logger = new Logger('GameGateway');
	// this.logger.log();

	async onModuleInit() {}
	async handleConnection(socket: Socket) // handleconnection 함수를 오버라이딩해서 사용
	{
		console.log("game.gateway.ts: connected.");
	}
	async handleDisconnect(socket: Socket)
	{
		console.log("game.gateway.ts: disconnected.");
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	

	@SubscribeMessage('ladderGameQueue') // ladder game 큐 시도
	handleEvent(@ConnectedSocket() socket: Socket, @MessageBody() data)
	{
		// 인가? user id?
		console.log("log: ladder game queue start.");
		// socket.queue = true; // 큐 잡는 중이라는 표시?
		console.log("============ socket ================");
		console.log(socket);
		console.log("============ data ================");
		console.log(data);
		const opponent = queueProcess(socket);
		if (opponent === null)
		{
			console.log("log: no game now.");
			socket.emit('noLadderGame');
		}
	}
}
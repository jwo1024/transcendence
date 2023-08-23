import { Injectable } from '@nestjs/common';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
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
	barLeftY: number,
	barRightY: number,
	ballX: number,
	ballY: number,
}

// chat 소켓과의 관계:
// 채팅방의 소켓을 그대로 가져와서 쓰기 or 게임 소켓 새로 만들기..?
// 그대로 가져오는 게 더 맞을 것 같긴 함

@Injectable()
@WebSocketGateway({ namespace: 'game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class GameGateway {
	
	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	// front side 예측도 //
	// ladderGameButton.addEventListener("mouseclick", HandleLadderGameButton);
	// async funcion HandleLadderGameButton(event)
	// {
	//		event.preventDefault();
	//		...
	//		socket.emit("searchMatch", (넘겨줄 데이터));
	// 		...
	// }

	// 'localhost:3000/game' 처리
	@SubscribeMessage('game')
	handleEvent(client: Socket, data: any){}
}
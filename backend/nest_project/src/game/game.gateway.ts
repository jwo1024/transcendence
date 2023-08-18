import { Injectable } from '@nestjs/common';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server } from 'ws';

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

@Injectable()
@WebSocketGateway({ namespace: 'game' })
export class GameGateway {
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('game')
	handleEvent(){}
}
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { GameField, Ball, Paddle } from './interface/game.interface';
import { ConnectedPlayerService } from './service/connectedPlayer.service';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchEntity } from './entities/match.entity';


import { MatchService } from './service/match.service';
import { HistoryService } from './service/history.service';
import { HistoryEntity } from './entities/history.entity';

import { Player } from './dto/player.dto';


async function collision(b: Ball, p: Paddle)
{
	const paddleLocation =
	{
	  top: p.y,
	  bottom: p.y + p.height,
	  left: p.x,
	  right: p.x + p.width,
	};

	const ballLocation =
	{
	  top: b.y - b.radius,
	  bottom: b.y + b.radius,
	  left: b.x - b.radius,
	  right: b.x + b.radius,
	};

	return (
	  ballLocation.right > paddleLocation.left &&
	  ballLocation.left < paddleLocation.right &&
	  ballLocation.top < paddleLocation.bottom &&
	  ballLocation.bottom > paddleLocation.top
	);
  }

async function resetBall(gameField: GameField)
{
	gameField.ballX = gameField.canvasWidth / 2;
	gameField.ballY = gameField.canvasHeight / 2;
	gameField.ballXvelocity = -3;
	gameField.ballYvelocity = 3;
	gameField.ballSpeed = 3;
}

async function playGame(server: Server, match: MatchEntity, gameField: GameField)
{
	// location of ball
	gameField.ballX += gameField.ballXvelocity;
	gameField.ballY += gameField.ballYvelocity;

	// collision with ball and top & bottom of canvas
	if (gameField.ballY + gameField.ballRadius > gameField.canvasHeight
		|| gameField.ballY - gameField.ballRadius < 0)
	{
		gameField.ballYvelocity = -gameField.ballYvelocity;
	}

	// collision with ball and paddle
	const tempBall: Ball =
	{
		x: gameField.ballX,
		y: gameField.ballY,
		radius: gameField.ballRadius,
	}
	const tempPaddle: Paddle =
	{
		x: 0,
		y: 0,
		width: 10,
		height: 100,
	}
	if (gameField.ballX + gameField.ballRadius < gameField.canvasWidth / 2)
	{
		tempPaddle.x = gameField.paddleLeftX;
		tempPaddle.y = gameField.paddleLeftY;
	}
	else
	{
		tempPaddle.x = gameField.paddleRightX;
		tempPaddle.y = gameField.paddleRightY;
	}

	if (await collision(tempBall, tempPaddle))
	{
		const collidePoint =
			(tempBall.y - (tempPaddle.y + tempPaddle.height / 2)) / (tempPaddle.height / 2);
		const angleRad = (Math.PI / 4) * collidePoint;
		const direction = tempBall.x + tempBall.radius < gameField.canvasWidth / 2 ? 1 : -1;

		gameField.ballXvelocity = direction * gameField.ballSpeed * Math.cos(angleRad);
		gameField.ballYvelocity = gameField.ballSpeed * Math.sin(angleRad);

		gameField.ballSpeed += 0.1;
	}

	// check score
	if (gameField.ballX - gameField.ballRadius < 0)
	{
		++gameField.scoreRight;
		this.MatchService.updateRightScore(match.match_id, gameField.scoreRight);
		
		if (gameField.scoreRight === 7)
		{
			this.endGame(match, null);
		}
		resetBall(gameField);
	}
	else if (gameField.ballX + gameField.ballRadius > gameField.canvasWidth)
	{
		++gameField.scoreLeft;
		this.MatchService.updateLeftScore(match.match_id, gameField.scoreRight);

		if (gameField.scoreLeft === 7)
		{
			this.endGame(match, null);
		}
		resetBall(gameField);
	}

	server.to(this.connectedPlayerService.getPlayer(match.playerLeft)).emit('updateCanvas', gameField);
	server.to(this.connectedPlayerService.getPlayer(match.playerRight)).emit('updateCanvas', gameField);
}

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요
// todo: 게임 시작하기 전에 대기 화면?

@Injectable()
@WebSocketGateway({ namespace: 'ladder_game' })
export class LadderGameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{

	private logger = new Logger('LadderGameGateway');

	private ladderQueue: Player[];
	private resetQueueTime: number;
	private currentQueueTime: number;
	private ladderRange: number;
	private gameFieldArr: GameField[];

	// constructor
	constructor(
		private connectedPlayerService: ConnectedPlayerService,
		private profileService: ProfileService,
		private matchService: MatchService,
		private historyService: HistoryService,
	)
	{
		this.ladderQueue = [];
		this.resetQueueTime = Date.now();
		this.currentQueueTime = 0;
		this.ladderRange = 500;
		this.gameFieldArr = [];

		setInterval(this.queueProcess, 1000);
	}


	async onModuleInit() 
	{
		this.connectedPlayerService.deleteAll();
	}

	async handleConnection(socket: Socket)
	{
		this.logger.log(`Ladder Game Server: socketId [ ${socket.id} ] connected.`);
		// 토큰, User 데이터와 소켓 아이디 결합하여 Player 객체에 저장
		// user의 소켓 id 정보
		// 인증 관련 부분(토큰 및 user 정보 socket에 주입 )
		// const token = socket.handshake.headers.authorization;
		// jiwolee님이 알려주신 대로 프론트에 추가 -> ok
		
		// //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
		// const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
		// if (!userId)
		// 	return this.disconnect(socket);
		// const userProfile = await this.profileService.getUserProfileById(userId);
		// if (!userProfile)
		// 	return this.disconnect(socket);
		const userId = 99833;
		const current  = await this.connectedPlayerService.createPlayer(userId, socket.id);

		this.ladderQueue.push(current);

		this.logger.log(`current Player : ${current.id}, ${current.socketId}`);
	}

	async handleDisconnect(socket: Socket)
	{
		// socket.emit('Error', new UnauthorizedException());
		this.logger.log(`Ladder Game Server: socketId [ ${socket.id} ] disconnected.`);

		// 게임 도중 끊긴 연결이면, 게임 종료(매치 패배 처리)
		const player_id = (await this.connectedPlayerService.getPlayerBySocketId(socket.id)).id;
		const match_id = (await this.matchService.getByPlayerId(player_id)).match_id;
		if (match_id)
		{
			this.endGame(match_id, socket.id);
		}

		// 큐 잡는 도중 끊긴 연결이면, 래더 큐 배열에서도 삭제
		const dis_player = await this.connectedPlayerService.getPlayerBySocketId(socket.id);
		for (let i = 0; i < this.ladderQueue.length; ++i)
		{
			if (dis_player.id === this.ladderQueue[i].id)
			{
				this.ladderQueue.splice(i, 1);
				break ;
			}
		}

		this.connectedPlayerService.deletePlayerBySocketId(socket.id);
		socket.disconnect();
		// todo: 메인 화면으로? 새로고침 시 다시 게임 페이지로 돌아오는 것 방지
	}

	async queueProcess()
	{
		// [ first-come, first-served basis queue ]
		// if (this.ladderQueue.length > 1)
		// {
		// 	this.setGame(this.ladderQueue[0].id, this.ladderQueue[1].id);
		// 	this.ladderQueue.splice(0, 2);
		// }

		// [ ladder basis queue ]
		if (this.ladderQueue.length < 2)
			return ;

		this.currentQueueTime = Date.now();
		if (this.currentQueueTime - this.resetQueueTime > 10000) // 1000 milliseconds == 1 second
		{
			this.ladderRange += 500;
		}

		for (let i = 0; i < this.ladderQueue.length; ++i)
		{
			for (let j = i + 1; j < this.ladderQueue.length; ++j)
			{
				const player1Ladder = await this.profileService.getLadderById(this.ladderQueue[i].id);
				const player1less = player1Ladder - this.ladderRange;
				const player1greater = player1Ladder + this.ladderRange;
				const player2Ladder = await this.profileService.getLadderById(this.ladderQueue[j].id);

				if ((player2Ladder >= player1less) && (player2Ladder <= player1greater))
				{
					this.setGame(this.ladderQueue[i].id, this.ladderQueue[j].id);
					this.ladderQueue.splice(i, 1);
					this.ladderQueue.splice(j - 1, 1); // 바로 위에서 요소 하나 삭제되므로 인덱스가 하나씩 당겨짐
					this.resetQueueTime = Date.now();
					this.ladderRange = 500;
					return ;
				}
			}
		}
	}
	
	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	private async setGame(userId1: number, userId2: number)
	{
		const currentMatch = await this.matchService.create(userId1, userId2, "ladder");
		if (!currentMatch)
		{
			// todo: 매치가 성사되지 않음을 알리고 게임 메인 화면 등으로 나가는 프론트
			return ;
		}
		this.startGame(currentMatch);
	}

	async startGame(match : MatchEntity)
	{
		const player1 = await this.connectedPlayerService.getPlayer(match.playerLeft);
		const player2 = await this.connectedPlayerService.getPlayer(match.playerRight);

		const profile1 = await this.profileService.getUserProfileById(match.playerLeft);
		const profile2 = await this.profileService.getUserProfileById(match.playerRight);

		this.server.to(player1.socketId).emit("setMiniProfile", profile1, profile2);
		this.server.to(player2.socketId).emit("setMiniProfile", profile1, profile2);

		const gameField: GameField = {
			canvasWidth: 800,
			canvasHeight: 600,
			paddleLeftX: 0,
			paddleLeftY: 42,
			paddleRightX: 800 - 10,
			paddleRightY: 42,
			scoreLeft: 0,
			scoreRight: 0,
			ballX: 800 / 2,
			ballY: 600 / 2,
			ballRadius: 10,
			ballXvelocity: 3,
			ballYvelocity: 3,
			ballSpeed: 3,
			matchId: match.match_id,
			gameTimer: null,
		}

		this.gameFieldArr.push(gameField);
		gameField.gameTimer = setInterval(playGame, 30, this.server, match, gameField);
	}

	private async getGameFieldByMatchId(match_id: number)
	{
		for (let i = 0; i < this.gameFieldArr.length; ++i)
		{
			if (this.gameFieldArr[i].matchId === match_id)
			return this.gameFieldArr[i];
		}
	}

	@SubscribeMessage('mouseMove')
	async movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() userY: number)
	{
		const player = await this.connectedPlayerService.getPlayerBySocketId(socket.id);
		const match = (await this.matchService.getByPlayerId(player.id));
		const opponent = await this.matchService.getOpponentByPlayerId(match.match_id, player.id);
		const gameField = await this.getGameFieldByMatchId(match.match_id);
		
		if (userY < 0)
		{
			userY = 0;
		}
		else if (userY > 500)
		{
			userY = 500;
		}

		if (match.playerLeft === player.id)
		{
			gameField.paddleLeftY = userY;
			this.server.to(player.socketId).emit('paddleMove', gameField);
			this.server.to(opponent.socketId).emit('paddleMove', gameField);
		}
		else if (match.playerRight === player.id)
		{
			gameField.paddleRightY = userY;
			this.server.to(player.socketId).emit('paddleMove', gameField);
			this.server.to(opponent.socketId).emit('paddleMove', gameField);
		}
	}

	async endGame(match_id: number, socket_id: string)
	{
		const gameField = await this.getGameFieldByMatchId(match_id);
		clearInterval(gameField.gameTimer);
		const match = await this.matchService.getByMatchId(match_id);

		if (socket_id)
		{
			const loser_id = (await this.connectedPlayerService.getPlayerBySocketId(socket_id)).id;
			if ( match.playerLeft === loser_id)
			{
				this.historyService.create(match.playerRight, match.playerLeft, match.scoreRight, match.scoreLeft);
				this.profileService.downLadder(loser_id);
				this.profileService.upLadder(match.playerRight);
				this.profileService.updateLoses(loser_id);
				this.profileService.updateWins(match.playerRight);
			}
			else
			{
				this.historyService.create(match.playerLeft, match.playerRight, match.scoreLeft, match.scoreRight);
				this.profileService.downLadder(loser_id);
				this.profileService.upLadder(match.playerLeft);
				this.profileService.updateLoses(loser_id);
				this.profileService.updateWins(match.playerLeft);
			}
			this.matchService.deleteByMatchId(match.match_id);
			// todo: 승패 알려주고 메인 화면으로 돌아가는 프론트
			return ;
		}
		
		if (match.scoreLeft > match.scoreRight)
		{
			this.historyService.create(match.playerLeft, match.playerRight, match.scoreLeft, match.scoreRight);
			this.profileService.downLadder(match.playerRight);
			this.profileService.upLadder(match.playerLeft);
			this.profileService.updateLoses(match.playerRight);
			this.profileService.updateWins(match.playerLeft);
	}
		else
		{
			this.historyService.create(match.playerRight, match.playerLeft, match.scoreRight, match.scoreLeft);
			this.profileService.downLadder(match.playerLeft);
			this.profileService.upLadder(match.playerRight);
			this.profileService.updateLoses(match.playerLeft);
			this.profileService.updateWins(match.playerRight);
		}
		this.matchService.deleteByMatchId(match.match_id);
		// todo: 승패 알려주고 메인 화면으로 돌아가는 프론트
	}
}
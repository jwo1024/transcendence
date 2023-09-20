import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { GameField, Ball, Paddle } from './interface/game.interface';
import { GameService } from './game.service';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchEntity } from './entities/match.entity';


import {MatchService} from './service/match.service';
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

	server.to(this.gameService.getPlayer(match.playerLeft)).emit('updateCanvas', gameField);
	server.to(this.gameService.getPlayer(match.playerRight)).emit('updateCanvas', gameField);
}

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요
// todo: 게임 시작하기 전에 대기 화면?

@Injectable()
@WebSocketGateway({ namespace: 'friendly_game' })
export class FriendlyGameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
	private logger = new Logger('FriendlyGameGateway');

	private gameFieldArr: GameField[];

	constructor(
		private gameService: GameService,
		private profileService: ProfileService,
		private matchService: MatchService,
		private historyService: HistoryService,
	)
	{
		this.gameFieldArr = [];
	}


	async onModuleInit() 
	{
		this.gameService.deleteAll();
	}

	async handleConnection(socket: Socket)
	{
		this.logger.log(`Friendly Game Server: socketId [ ${socket.id} ] connected.`);
		// 토큰, User 데이터와 소켓 아이디 결합하여 Player 객체에 저장
		// user의 소켓 id 정보
		// // //인증 관련 부분(토큰 및 user 정보 socket에 주입 )
		// const token = socket.handshake.headers.authorization;
		// jiwolee님이 알려주신 대로 프론트에 추가
		
		// //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
		// const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
		// if (!userId)
		// 	return this.disconnect(socket);
		// const userProfile = await this.profileService.getUserProfileById(userId);
		// if (!userProfile)
		// 	return this.disconnect(socket);
		const userId = 99833;
		const current  = await this.gameService.createPlayer(userId, socket.id);

		this.logger.log(`current Player : ${current.id}, ${current.socketId}`);
	}

	async handleDisconnect(socket: Socket)
	{
		// socket.emit('Error', new UnauthorizedException());
		this.logger.log(`Friendly Game Server: socketId [ ${socket.id} ] disconnected.`);

		// 게임 도중 끊긴 연결이면, 게임 종료(매치 패배 처리)
		const player_id = (await this.gameService.getPlayerBySocketId(socket.id)).id;
		const match_id = (await this.matchService.getByPlayerId(player_id)).match_id;
		if (match_id)
		{
			this.endGame(match_id, socket.id);
		}

		this.gameService.deletePlayerBySocketId(socket.id); //id로 삭제
		socket.disconnect();
		// todo: 메인 화면으로? 새로고침 시 다시 게임 페이지로 돌아오는 것 방지
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	private async setGame(userId1: number, userId2: number)
	{
		// todo: game_type 선택 - > original, speedUp, smallBall 중에 하나
		const currentMatch = await this.matchService.create(userId1, userId2, "original");
		if (!currentMatch)
		{
			// todo: 매치가 성사되지 않음을 알리고 게임 메인 화면 등으로 나가는 프론트
			return ;
		}
		this.startGame(currentMatch);
	}

	async startGame(match : MatchEntity)
	{
		const player1 = await this.gameService.getPlayer(match.playerLeft);
		const player2 = await this.gameService.getPlayer(match.playerRight);

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

		// todo: game_type에 따라 게임필드 값 변경
		// if (match.game_type === ?)
		// {
		// 	gameField.ballSpeed = 6;
		// 	// or
		// 	gameField.ballRadius = 5;
		// }

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
		const player = await this.gameService.getPlayerBySocketId(socket.id);
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

	@SubscribeMessage("waitGame")
	async waitGame( @ConnectedSocket() socket: Socket, @MessageBody() proposedId : number)
	{
		// todo: 대기 화면
		// waiter or accepter가 game_type에 대한 데이터 받고 setGame()에 인자 넘겨주며 실행
		// @MessageBody() { proposedId: number, gameType: string }
	}

	@SubscribeMessage("acceptGame")
	async acceptGame( @ConnectedSocket() socket: Socket, @MessageBody() proposingId : number)
	{
		this.setGame(proposingId, (await this.gameService.getPlayerBySocketId(socket.id)).id);
	}

	async endGame(match_id: number, socket_id: string)
	{
		const gameField = await this.getGameFieldByMatchId(match_id);
		clearInterval(gameField.gameTimer);
		const match = await this.matchService.getByMatchId(match_id);

		if (socket_id)
		{
			const loser_id = (await this.gameService.getPlayerBySocketId(socket_id)).id;
			if ( match.playerLeft === loser_id)
			{
				// todo: 이미 소켓 연결 끊긴 left
				// todo: right에게 승리 화면 표시
			}	
			else
			{
				// todo: 이미 소켓 연결 끊긴 right
				// todo: left에게 승리 화면 표시
			}
			this.matchService.deleteByMatchId(match.match_id);
			// todo: 승패 알려주고 메인 화면으로 돌아가는 프론트
			return ;
		}

		if (match.scoreLeft > match.scoreRight)
		{
			// todo: left, right에게 최종 스코어 및 승패 화면 표시
		}
		else
		{
			// todo: left, right에게 최종 스코어 및 승패 화면 표시
		}
		this.matchService.deleteByMatchId(match.match_id);
		// todo: 승패 알려주고 메인 화면으로 돌아가는 프론트
	}

}
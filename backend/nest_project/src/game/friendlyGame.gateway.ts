import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { GameField, Ball, Paddle } from './interface/game.interface';
import { ConnectedPlayerService } from './service/connectedPlayer.service';

// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchEntity } from './entities/match.entity';


import {MatchService} from './service/match.service';
// import { HistoryService } from './service/history.service';
// import { HistoryEntity } from './entities/history.entity';

import { Player } from './dto/player.dto';
import { ConnectedFriendlyPlayerService } from './service/connectedFriendlyPlayer.service';
// import { ConnectedFriendlyPlayerEntity } from './entities/connectedFriendlyPlayer.entity';
import { FriendlyPlayer } from './dto/friendlyPlayer.dto';

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요

@Injectable()
@WebSocketGateway({ namespace: 'friendly_game' })
export class FriendlyGameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{

	private logger = new Logger('FriendlyGameGateway');

	private gameFieldArr: GameField[];

	constructor(
		private connectedFriendlyPlayerService: ConnectedFriendlyPlayerService,
		private profileService: ProfileService,
		private matchService: MatchService,
	)
	{
		this.gameFieldArr = [];
	}


	@WebSocketServer()
	server: Server;

	async onModuleInit() 
	{
		this.connectedFriendlyPlayerService.deleteAll();
	}

	async handleConnection(socket: Socket)
	{
		this.logger.log(`Friendly Game Server: socketId [ ${socket.id} ] connected.`);
		const token = socket.handshake.headers.authorization;

		// //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
		const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
		if (!userId)
		{
			return socket.disconnect();
			// 클라이언트에서 이벤트 인지하면 menu로 리다이렉션
		}
		const userProfile = await this.profileService.getUserProfileById(userId);
		if (!userProfile)
		{
			return socket.disconnect();
			// 클라이언트에서 이벤트 인지하면 menu로 리다이렉션
		}
		const current = await this.connectedFriendlyPlayerService.createPlayer(userId, socket.id);
		socket.emit('savePlayer', (inviteData) => {
			this.connectedFriendlyPlayerService.updateInvitation(current, inviteData);
		});
		this.logger.log(`current Player: ${current.id}, ${current.socketId}`);
		
		if (this.connectedFriendlyPlayerService.isHostPlayer(current))
		{
			this.waitGame(current);
		}
		else if (this.connectedFriendlyPlayerService.isGuestPlayer(current))
		{
			this.acceptGame(current);
		}
		else
		{
			return this.endPlayer(socket.id, current.id);
		}
	}

	async handleDisconnect(socket: Socket)
	{
		// socket.emit('Error', new UnauthorizedException());

		const player = (await this.connectedFriendlyPlayerService.getPlayerBySocketId(socket.id));
		const match_id = (await this.matchService.getByPlayerId(player.id)).match_id;
		if (match_id)
		{
			await this.endGame(match_id, player.id);
		}

		if (player.id === player.hostId)
		{
			clearInterval(player.checkTimer);
		}

		this.endPlayer(socket.id, player.id);
	}

	private async endPlayer(socket_id: string, player_id: number)
	{
		// socket.emit('Error', new UnauthorizedException());
		this.connectedFriendlyPlayerService.deletePlayer(player_id);
		this.server.in(socket_id).disconnectSockets(true);
		this.logger.log(`Friendly Game Server: socketId [ ${socket_id} ] disconnected.`);
	};

	private async checkRefuse(host: FriendlyPlayer, waitTime: number)
	{
		if (host.refuseGame === true)
		{
			clearInterval(host.checkTimer);
			this.endPlayer(host.socketId, host.id);
		}
		const nowTime = Date.now();
		if (nowTime - waitTime > 35000) // 35 seconds
		{
			clearInterval(host.checkTimer);
			this.endPlayer(host.socketId, host.id);
		}
	}

	private async waitGame(host: FriendlyPlayer)
	{
		const currentTime = Date.now();
		host.checkTimer = setInterval(this.checkRefuse, 1000, host, currentTime) as unknown as number;
	}

	private async acceptGame(guest: FriendlyPlayer)
	{
		this.server.to(guest.socketId).emit("guestArrive");
	}

	@SubscribeMessage('chooseGameType')
	async setGame(@ConnectedSocket() socket: Socket, @MessageBody() gameType: string)
	{
		const host = await this.connectedFriendlyPlayerService.getHostbySocketId(socket.id);
		const guest = await this.connectedFriendlyPlayerService.getPlayerBySocketId(socket.id);
		const currentMatch = await this.matchService.createCustom(host.id, guest.id, gameType);
		if (!currentMatch)
		{
			this.endPlayer(socket.id, guest.id);
			return ;
		}
		clearInterval(host.checkTimer);
		this.startGame(currentMatch);
	}

	async startGame(match : MatchEntity)
	{
		const player1 = await this.connectedFriendlyPlayerService.getPlayer(match.playerLeft);
		const player2 = await this.connectedFriendlyPlayerService.getPlayer(match.playerRight);

		const profile1 = await this.profileService.getUserProfileById(match.playerLeft);
		const profile2 = await this.profileService.getUserProfileById(match.playerRight);
		
		this.server.to(player1.socketId).emit("setMiniProfile", profile1, profile2);
		this.server.to(player2.socketId).emit("setMiniProfile", profile1, profile2);

		this.server.to(player1.socketId).emit('startGame');
		this.server.to(player2.socketId).emit('startGame');

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

		if (match.game_type === "speedUp")
		{
			gameField.ballSpeed = 6;
		}
		else if (match.game_type === "smallBall")
		{
			gameField.ballRadius = 5;
		}
		else if (match.game_type === "enjoyAll")
		{
			gameField.ballSpeed = 6;
			gameField.ballRadius = 5;
		}

		this.logger.log(`friendly/startGame : ${match.match_id} -> ${player1.id} vs ${player2.id}`);
		this.gameFieldArr.push(gameField);
		gameField.gameTimer = setInterval(playGame, 30, this.server, match, player1, player2, gameField);
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
		const player = await this.connectedFriendlyPlayerService.getPlayerBySocketId(socket.id);
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

	private async sendMatchResult(winner_id: number, loser_id:number, normal_end: boolean)
	{
		const winner_nickname = (await this.profileService.getUserProfileById(winner_id)).nickname;
		const loser_nickname = (await this.profileService.getUserProfileById(loser_id)).nickname;
		this.server.to((await this.connectedFriendlyPlayerService.getPlayer(winner_id)).socketId).emit('endGame', winner_nickname, loser_nickname);
		if (normal_end == true)
		{
			this.server.to((await this.connectedFriendlyPlayerService.getPlayer(loser_id)).socketId).emit('endGame', winner_nickname, loser_nickname);
		}
	}

	async endGame(match_id: number, loser_id: number)
	{
		this.logger.log(`endGame : match finished.`);

		const gameField = await this.getGameFieldByMatchId(match_id);
		clearInterval(gameField.gameTimer);
		const match = await this.matchService.getByMatchId(match_id);
		let winner_id = 0;

		if (loser_id)
		{
			if (match.playerLeft === loser_id)
			{
				winner_id = match.playerRight;
			}	
			else
			{
				winner_id = match.scoreLeft;
			}

			this.sendMatchResult(winner_id, loser_id, false);
			this.matchService.deleteByMatchId(match.match_id);
			this.endPlayer((await this.connectedFriendlyPlayerService.getPlayer(winner_id)).socketId, winner_id);
			return ;
		}

		if (match.scoreLeft > match.scoreRight)
		{
			winner_id = match.playerLeft;
			loser_id = match.scoreRight;
		}
		else
		{
			winner_id = match.playerRight;
			loser_id = match.playerLeft;
		}

		this.sendMatchResult(winner_id, loser_id, true);
		this.matchService.deleteByMatchId(match.match_id);
		this.endPlayer((await this.connectedFriendlyPlayerService.getPlayer(winner_id)).socketId, winner_id);
		this.endPlayer((await this.connectedFriendlyPlayerService.getPlayer(loser_id)).socketId, loser_id);
	}

}


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

async function playGame(server: Server, match: MatchEntity, player1: Player, player2: Player, gameField: GameField)
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

	server.to(player1.socketId).emit('updateCanvas', gameField);
	server.to(player2.socketId).emit('updateCanvas', gameField);
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { MatchInfo, GameField, Ball, Paddle } from './interface/game.interface';
import { GameService } from './game.service';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

//인증 
import * as jwt from 'jsonwebtoken';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchEntity } from './entities/match.entity';


import {MatchService} from './service/match.service';
import { HistoryService } from './service/history.service';
import { HistoryEntity } from './entities/history.entity';

import { Player } from './dto/player.dto';

// 래더 큐 잡는 로직
async function queueProcess()
{
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




// temp variables for unit test
const player1: Player = {
			id: 0,
			socketId: "not yet",
		};
const player2: Player = {
			id: 1,
			socketId: "not yet",
		};

const gameField: GameField = {
	// canvas 크기 바뀔 경우 고려해서 수정 필요
	canvasWidth: 800,
	canvasHeight: 600,
	paddleLeftX: 0, // 캔버스의 x축 왼쪽 끝
	paddleLeftY: 42,
	paddleRightX: 800 - 10, // 캔버스의 x축 오른쪽 끝
	paddleRightY: 42,
	scoreLeft: 0,
	scoreRight: 0,
	ballX: 800 / 2,
	ballY: 600 / 2,
	ballRadius: 10,
	ballXvelocity: 3,
	ballYvelocity: 3,
	ballSpeed: 3,
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
		// check end game
		this.MatchService.updateRightScore(match.match_id, gameField.scoreRight);

		if (gameField.scoreRight === 7)
		{
			this.endGame(match, null);
		}
		//resetBall();
		gameField.ballX = gameField.canvasWidth / 2;
		gameField.ballY = gameField.canvasHeight / 2;
		gameField.ballXvelocity = -3;
		gameField.ballYvelocity = 3;
		gameField.ballSpeed = 3;
	}
	else if (gameField.ballX + gameField.ballRadius > gameField.canvasWidth)
	{
		++gameField.scoreLeft;
		this.MatchService.updateLeftScore(match.match_id, gameField.scoreRight);
		// check end game
		if (gameField.scoreLeft === 7)
		{
			this.endGame(match, null);
		}
		//resetBall();
		gameField.ballX = gameField.canvasWidth / 2;
		gameField.ballY = gameField.canvasHeight / 2;
		gameField.ballXvelocity = 3;
		gameField.ballYvelocity = 3;
		gameField.ballSpeed = 3;
	}

	server.to(this.gameService.getPlayer(match.playerLeft)).emit('updateCanvas', gameField);
	server.to(this.gameService.getPlayer(match.playerRight)).emit('updateCanvas', gameField);
	// server.to(matchInfo.roomName).emit('updateCanvas', gameField);
}

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요



@Injectable()
@WebSocketGateway({ namespace: 'ladder_game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class LadderGameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{

	private logger = new Logger('LadderGameGateway');
	// this.logger.log();

	// variables
	private ladderQueue: Player[];

	// constructor
	constructor(
		private gameService: GameService,
		private profileService: ProfileService,
		private matchService: MatchService,
		private historyService: HistoryService,
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


	async onModuleInit() 
	{
		this.gameService.deleteAll();
	}


	private async disconnect(socket: Socket) {
		// socket.emit('Error', new UnauthorizedException()); //ee
		
		const player = (await this.gameService.getPlayerBySocketId(socket.id)).id;
		const match_id = this.matchService.findByid(id); //service player id left Right undeifined , 
		if (match_id )
		this.endGame(match_id, socket.id);

		this.gameService.deletePlayerBySocketId(socket.id);

		socket.disconnect();
	  };
	
	async handleConnection(socket: Socket)
	{
		console.log("Friendly Game Server: connected.");
		// 토큰, User 데이터와 소켓 아이디 결합하여 Player 객체에 저장
		// user의 소켓 id 정보
		// // //인증 관련 부분(토큰 및 user 정보 socket에 주입 )
		// const token = socket.handshake.headers.authorization;
		
		// //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
		// const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
		// if (!userId)
		// 	return this.disconnect(socket);
		// const userProfile = await this.profileService.getUserProfileById(userId);
		// if (!userProfile)
		// 	return this.disconnect(socket);
		const userId = 99833;
		const current  = await this.gameService.createPlayer(userId, socket.id);
		this.logger.log(`current Player : ${current.id}, ${current.socketId}`)
		this.logger.log(`socketId : ${socket.id}`)
	}

	// async onModuleInit() {}
	// // 연결, 끊길 시 -> secket id 리뉴얼하기
	// async handleConnection(socket: Socket) // handleconnection 함수를 오버라이딩해서 사용
	// {
	// 	console.log("Ladder Game Server: connected.");
	// 	// 토큰, User 데이터와 소켓 아이디 결합하여 Player 객체에 저장
	// 	// user의 소켓 id 정보

	// 	// const player: Player = await this.gameService.createPlayer(socket.id);
	// 	// console.log(player);

	// 	if (player1.socketId === "not yet")
	// 	{
	// 		player1.socketId = socket.id;
	// 		console.log(player1);
	// 	}
	// 	else if (player2.socketId === "not yet")
	// 	{
	// 		player2.socketId = socket.id;
	// 		console.log(player2);
	// 	}
	// }
	async handleDisconnect(socket: Socket)
	{
		console.log("Server: disconnected.");
		// 유저의 소켓 id 삭제?
		// await this.gameService.deletePlayerBySocketId(socket.id);
		this.gameService.deletePlayerBySocketId(socket.id); //id로 삭제
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

	@SubscribeMessage('waitGame')
	async waitGame(@ConnectedSocket() socket: Socket)
	{
		console.log("waitGame funtion start!");
		//큐에서 대기?


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
	async startGame(match : MatchEntity)
	{

		const player1 = await this.gameService.getPlayer(match.playerLeft);
		const player2 = await this.gameService.getPlayer(match.playerRight);


		const profile1 = await this.profileService.getUserProfileById(match.playerLeft);
		const profile2 = await this.profileService.getUserProfileById(match.playerRight);
		// socket.join(match.match_id);
		// this.server.to(player1)
		// match.playerLeft.
		// console.log(`socket ${socket.id} join room of [${match.match_id}]`);
		
		//미니 프로필 보내기
		this.server.to(player1.socketId).emit("setMiniProfile", profile1, profile2);
		this.server.to(player2.socketId).emit("setMiniProfile", profile1, profile2);

		// todo: 한쪽이 게임 수락하면, 동시에 양쪽에 뜨도록 server.to(roomName).emit()으로 수정하기
		// socket.emit('setMiniProfile', playerLeft, playerRight, () => {
		// 	console.log("sending mini profile data OK.");
		// });

		// 특정 room에만 이벤트 발생
		// playGame();
		// movePlayer();

		const timer = setInterval(playGame, 30, this.server, match, gameField);
		// const timer = setInterval(playGame, 30, this.server, match, gameField),;
	}

	@SubscribeMessage('mouseMove')
	async movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() userY: number)
	{
		// need to take parameters [ matchInfo, gameField ]

		if (userY < 0)
		{
			userY = 0;
		}
		else if (userY > 500)
		{
			userY = 500;
		}

		if (socket.id === player1.socketId)
		{
			gameField.paddleLeftY = userY;
			this.server.to("Game Room").emit('paddleMove', gameField);
		}
		else if (socket.id === player2.socketId)
		{
			gameField.paddleRightY = userY;
			this.server.to("Game Room").emit('paddleMove', gameField);
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

	//2명 플레이어 매칭이후 메서드
	private async setGame( userId1: number, userId2: number)
	{
			const currentMatch = await this.matchService.create(userId1, userId2, "ladder");
			// socket.join(match.match_id);
			
			this.startGame(currentMatch);			
	}


	async endGame(match_id : number, socket_id : string)
	{
		let win_user_id = 0;
		 let lose_user_id = 0;
		 let win_score = 0;
		 let lose_score = 0;
		const match = await this.matchService.getByMatchId(match_id);
		if (socket_id)
		{
			const loser_id = (await this.gameService.getPlayerBySocketId(socket_id)).id;
			if ( match.playerLeft === loser_id)
			{
				win_user_id = match.playerRight;
				lose_user_id = match.playerLeft;
				win_score = match.scoreRight;
				lose_score = match.scoreLeft;
			}	
			else
			{
				win_user_id = match.playerLeft;
				lose_user_id = match.playerRight;
				win_score = match.scoreLeft;
				lose_score = match.scoreRight;
			}
			this.historyService.create(win_user_id, lose_user_id, win_score, lose_score);
			this.matchService.delete(match.match_id);
			return ;
		}

		if (match.scoreLeft > match.scoreRight)
			this.historyService.create(match.playerLeft, match.playerRight, match.scoreLeft, match.scoreRight);
		else
			this.historyService.create(match.playerRight, match.playerLeft, match.scoreRight, match.scoreLeft);
		this.matchService.delete(match.match_id);
		
		}

}


@Injectable()
@WebSocketGateway({ namespace: 'friendly_game' }) //웹소켓 리스너 기능 부여하는 데코레이터
export class FriendlyGameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
	private logger = new Logger('FriendlyGameGateway');
	// this.logger.log();

	// constructor
	constructor(
		private gameService: GameService,
	)
	{}

	// 게임 기다리기 (친구 신청)
		// 친구에게 게임 신청하고 대기 (게임 타입 결정)
		// 친구로부터 게임 신청 받고 승낙/거절
	// 게임 설정(게임 모드, 타입, 게임info 와 게임field 값 설정)
	// 게임방을 만들고 두 플레이어를 조인
	// 게임 시작!
	// 두 클라이언트에게 데이터 받고 서버에서 양쪽에 일괄 전송
	// 각 소켓, 각 방에 대한 정보 출력 (디버깅 목적)

	async onModuleInit() {}
	// 연결, 끊길 시 -> secket id 리뉴얼하기
	async handleConnection(socket: Socket)
	{
		console.log("Friendly Game Server: connected.");
		// 토큰, User 데이터와 소켓 아이디 결합하여 Player 객체에 저장
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
		// if (player1.socketId === socket.id)
		// {
		// 	player1.socketId = "not yet";
		// }
		// if (player2.socketId === socket.id)
		// {
		// 	player2.socketId = "not yet";
		// }
		// const player = (await this.gameService.getPlayerBySocketId(socket.id)).id;
		// const match_id = this.match
	}

	@WebSocketServer() // 현재 동작 중인 웹소켓 서버 객체
	server: Server;

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
		const gameField: GameField = {
			canvasWidth: 800,
			canvasHeight: 600,
			paddleLeftX: 0, // 캔버스의 x축 왼쪽 끝
			paddleLeftY: 42,
			paddleRightX: 800 - 10, // 캔버스의 x축 오른쪽 끝
			paddleRightY: 42,
			scoreLeft: 0,
			scoreRight: 0,
			ballX: 800 / 2,
			ballY: 600 / 2,
			ballRadius: 10,
			ballXvelocity: 3,
			ballYvelocity: 3,
			ballSpeed: 3,
		};
		

		// socket.join(matchInfo.roomName);
		// console.log(`socket ${socket.id} join room of [${matchInfo.roomName}]`);
		
		// todo: 한쪽이 게임 수락하면, 동시에 양쪽에 뜨도록 server.to(roomName).emit()으로 수정하기

		

		socket.emit('setMiniProfile', playerLeft, playerRight, () => {
			console.log("sending mini profile data OK.");
		});

		// 특정 room에만 이벤트 발생
		// playGame();
		// movePlayer();

		const timer = setInterval(playGame, 30, this.server, matchInfo, gameField);
	}

	@SubscribeMessage('mouseMove')
	async movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() userY: number)
	{
		// need to take parameters [ matchInfo, gameField ]

		if (userY < 0)
		{
			userY = 0;
		}
		else if (userY > 500)
		{
			userY = 500;
		}

		if (socket.id === player1.socketId)
		{
			gameField.paddleLeftY = userY;
			this.server.to("Game Room").emit('paddleMove', gameField);
		}
		else if (socket.id === player2.socketId)
		{
			gameField.paddleRightY = userY;
			this.server.to("Game Room").emit('paddleMove', gameField);
		}
	}

	@SubscribeMessage("acceptGame")
	async acceptGame( @ConnectedSocket() socket: Socket, @MessageBody() proposingId : number)
	{
		this.setGame(proposingId, (await this.gameService.getPlayerBySocketId(socket.id)).id);
	}


	// @SubscribeMessage("setGame")
		private async setGame( userId1: number, userId2: number)
	{

			const currentMatch = await this.matchService.create(userId1, userId2, "ladder");
			// socket.join(match.match_id);
			
			this.startGame(currentMatch);			
	}
}
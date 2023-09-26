import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import {
  playerProfile,
  GameField,
  Ball,
  Paddle,
  PaddlePair,
  CanvasChange,
} from './interface/game.interface';
import { ConnectedPlayerService } from './service/connectedPlayer.service';

// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchEntity } from './entities/match.entity';

import { MatchService } from './service/match.service';
import { HistoryService } from './service/history.service';
// import { HistoryEntity } from './entities/history.entity';

import { Player } from './dto/player.dto';
import { match } from 'assert';
import { dir } from 'console';
// import { Player } from './interface/game.interface';

let ladderQueue: Player[];
let resetQueueTime: number;
let currentQueueTime: number;
let ladderRange: number;

// let gameFieldArr: GameField[];
// const gameFieldMap = new Map();

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요

// todo: 삭제
const tryCatchLogger = new Logger('LadderGameGateway');

// todo : cors 처리
@Injectable()
@WebSocketGateway({ namespace: 'ladder_game', cors: { origin: '*' } })
export class LadderGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private logger = new Logger('LadderGameGateway');

  private gameFieldArr: GameField[];

  constructor(
    private connectedPlayerService: ConnectedPlayerService,
    private profileService: ProfileService,
    private matchService: MatchService,
    private historyService: HistoryService,
  ) {
    ladderQueue = [];
    resetQueueTime = Date.now();
    currentQueueTime = Date.now();
    ladderRange = 100;
    this.gameFieldArr = [];

    setInterval(() => this.queueProcess(), 1000);
  }

  @WebSocketServer()
  server: Server;

  async onModuleInit() {
    this.connectedPlayerService.deleteAll();
    this.matchService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Ladder Game Server: socketId [ ${socket.id} ] connected.`);
    const token = socket.handshake.headers.authorization;

    // //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결 끊음
    if (!jwt.decode(token.split('Bearer ')[1])) {
      return socket.disconnect();
    }
    const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
    if (!userId) {
      return socket.disconnect();
      // 클라이언트에서 이벤트 인지하면 menu로 리다이렉션
    }
    socket.data.userId = userId;
    const userProfile = await this.profileService.getUserProfileById(userId);
    if (!userProfile) {
      return socket.disconnect();
      // 클라이언트에서 이벤트 인지하면 menu로 리다이렉션
    }

    // todo: temp code
    // const temp = await this.connectedPlayerService.getPlayer(userProfile.id);
    // if (temp)
    // {
    //   this.connectedPlayerService.updateSocketId(temp, socket.id);
    //   this.profileService.ingame(userId);
    //   ladderQueue.push(temp);
    //   this.logger.log(`reconnected current Player : ${temp.id}, ${temp.socketId}`);
    //   return ;
    // }

    const current = await this.connectedPlayerService.createPlayer(
      userId,
      socket.id,
    );
    if (!current) {
      return socket.disconnect();
    }
    this.profileService.ingame(userId);
    ladderQueue.push(current);
    this.logger.log(`current Player : ${current.id}, ${current.socketId}`);
  }

  async handleDisconnect(socket: Socket) {
    // socket.emit('Error', new UnauthorizedException());

    if (await this.connectedPlayerService.getPlayerBySocketId(socket.id)) {
      const player_id = (
        await this.connectedPlayerService.getPlayerBySocketId(socket.id)
      ).id;
      this.logger.log(`[ ${socket.id} ]로 찾은 플레이어 [ ${player_id} ]`);
      // 큐 잡는 도중 끊긴 연결이면, 래더 큐 배열에서도 삭제
      for (let i = 0; i < ladderQueue.length; ++i) {
        if (player_id === ladderQueue[i].id) {
          ladderQueue.splice(i, 1);
          break;
        }
      }
      // this.logger.log(`소켓 끊긴 플레이어 삭제 후 래더 큐 : ${ladderQueue}`);

      if (!(await this.matchService.getByPlayerId(player_id))) {
        this.logger.log(`[ ${player_id} ] 플레이어는 게임을 하고 있진 않아..`);
        await this.connectedPlayerService.deletePlayer(player_id);
        this.profileService.logOn(socket.data.userId);
        socket.disconnect();
        return;
      } else {
        const match_id = (await this.matchService.getByPlayerId(player_id))
          .match_id;
        this.logger.log(
          `${player_id}는 ${match_id} 매치를 하다가 튕겼나봄 끝내주자`,
        );
        if (match_id) {
          await this.endGame(match_id, player_id);
        }
        await this.connectedPlayerService.deletePlayer(player_id);
        this.profileService.logOn(socket.data.userId);
        socket.disconnect();
        return;
      }
    }

    if (!(await this.connectedPlayerService.getPlayerBySocketId(socket.id))) {
      this.logger.log(`[ ${socket.id} ]로 찾아도 플레이어 없음`);
      this.profileService.logOn(socket.data.userId);
      socket.disconnect();
      return;
    }
  }

  private async endPlayer(socket_id: string, player_id: number) {
    // socket.emit('Error', new UnauthorizedException());
    this.server.in(socket_id).disconnectSockets(true);
    this.logger.log(
      `Ladder Game Server: [ ${player_id} -> ${socket_id} ] disconnected.`,
    );
  }

  async queueProcess() {
    try {
      // if (ladderQueue.length > 1)
      // {
      // 	// setGame(ladderQueue[0].id, ladderQueue[1].id);
      // 	this.setGame(ladderQueue[0].id, ladderQueue[1].id);
      // 	ladderQueue.splice(0, 2);
      // }

      if (ladderQueue.length < 2) return;

      currentQueueTime = Date.now();
      if (currentQueueTime - resetQueueTime > 10000) {
        // 1000 milliseconds == 1 second
        ladderRange += 100;
      }

      for (let i = 0; i < ladderQueue.length; ++i) {
        for (let j = i + 1; j < ladderQueue.length; ++j) {
          // console.log(ladderQueue[i]);
          // const ppp = this.connectedPlayerService.getPlayer(ladderQueue[i].id);
          // console.log(ppp);
          // const a = await ladderQueue[i].id;
          // const player1Ladder = await this.connectedPlayerService.getLadderById(a);
          const player1Ladder = await this.connectedPlayerService.getLadderById(
            ladderQueue[i].id,
          );
          // console.log(player1Ladder);
          const player1less = player1Ladder - ladderRange;
          const player1greater = player1Ladder + ladderRange;
          const player2Ladder = await this.connectedPlayerService.getLadderById(
            ladderQueue[j].id,
          );

          if (player2Ladder >= player1less && player2Ladder <= player1greater) {
            this.setGame(ladderQueue[i].id, ladderQueue[j].id);
            this.logger.log(
              `queueProcess : [ ${ladderQueue[i].id} ] vs [${ladderQueue[j].id}]`,
            );
            ladderQueue.splice(i, 1);
            ladderQueue.splice(j - 1, 1); // 바로 위에서 요소 하나 삭제되므로 인덱스가 하나씩 당겨짐
            resetQueueTime = Date.now();
            ladderRange = 100;
            return;
          }
        }
      }
    } catch (error) {
      tryCatchLogger.error(`queueProcess : ${error.message}`);
    }
  }

  private async setGame(userId1: number, userId2: number) {
    try {
      const currentMatch = await this.matchService.create(userId1, userId2);
      if (!currentMatch) {
        this.endPlayer(
          await this.connectedPlayerService.getSocketIdById(userId1),
          userId1,
        );
        this.endPlayer(
          await this.connectedPlayerService.getSocketIdById(userId2),
          userId2,
        );
        return;
      }
      this.logger.log(
        `setGame : match ${currentMatch.match_id} will soon start!`,
      );
      this.startGame(currentMatch);
    } catch (error) {
      tryCatchLogger.error(`setGame: ${error.message}`);
    }
  }

  async startGame(match: MatchEntity) {
    try {
      const player1 = await this.connectedPlayerService.getPlayer(
        match.playerLeft,
      );
      const player2 = await this.connectedPlayerService.getPlayer(
        match.playerRight,
      );

      const profileLeft = await this.profileService.getUserProfileById(
        match.playerLeft,
      );
      const profileRight = await this.profileService.getUserProfileById(
        match.playerRight,
      );

      const profile1: playerProfile = {
        nickname: profileLeft.nickname,
        ladder: profileLeft.ladder,
        wins: profileLeft.wins,
        loses: profileLeft.loses,
      };

      const profile2: playerProfile = {
        nickname: profileRight.nickname,
        ladder: profileRight.ladder,
        wins: profileRight.wins,
        loses: profileRight.loses,
      };

      this.server
        .to(player1.socketId)
        .emit('setMiniProfile', profile1, profile2);
      this.server
        .to(player2.socketId)
        .emit('setMiniProfile', profile1, profile2);

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
        ballXvelocity: 6,
        ballYvelocity: 6,
        ballSpeed: 10,
        matchId: match.match_id,
        gameTimer: null,
      };

      this.logger.log(
        `ladder/startGame : ${match.match_id} -> ${player1.id} vs ${player2.id}`,
      );
      this.gameFieldArr.push(gameField);
      gameField.gameTimer = setInterval(() => {
        this.playGame(this.server, match, player1, player2, gameField);
      }, 20);
    } catch (error) {
      tryCatchLogger.error(`startGame : ${error.message}`);
    }
  }

  private async getGameFieldByMatchId(match_id: number) {
    for (let i = 0; i < this.gameFieldArr.length; ++i) {
      if (this.gameFieldArr[i].matchId === match_id)
        return this.gameFieldArr[i];
    }
  }

  @SubscribeMessage('mouseMove')
  async movePlayer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userY: number,
  ) {
      const player = await this.connectedPlayerService.getPlayerBySocketId(
        socket.id,
      );
      if (!player) return;
      const match = await this.matchService.getByPlayerId(player.id);
      const opponent = await this.matchService.getOpponentByPlayerId(
        match.match_id,
        player.id,
      );
      if (!opponent) return;
      const gameField = await this.getGameFieldByMatchId(match.match_id);

      if (userY < 0) {
        userY = 0;
      } else if (userY > 500) {
        userY = 500;
      }

      const data: PaddlePair = {
        leftY: gameField.paddleLeftY,
        rightY: gameField.paddleRightY,
      };

      if (match.playerLeft === player.id) {
        gameField.paddleLeftY = userY;
        this.server.to(player.socketId).emit('paddleMove', data);
        this.server.to(opponent.socketId).emit('paddleMove', data);
      } else if (match.playerRight === player.id) {
        gameField.paddleRightY = userY;
        this.server.to(player.socketId).emit('paddleMove', data);
        this.server.to(opponent.socketId).emit('paddleMove', data);
      }
  }

  private async updateProfile(
    winner_id: number,
    loser_id: number,
    match_id: number,
  ) {
    this.connectedPlayerService.upLadder(winner_id);
    this.connectedPlayerService.downLadder(loser_id);
    this.connectedPlayerService.updateWins(winner_id);
    this.connectedPlayerService.updateLoses(loser_id);
    this.connectedPlayerService.updateRecentHistory(winner_id, match_id);
    this.connectedPlayerService.updateRecentHistory(loser_id, match_id);
  }

  private async sendMatchResult(
    winner_id: number,
    loser_id: number,
    normal_end: boolean,
  ) {
    const winner_nickname = (
      await this.profileService.getUserProfileById(winner_id)
    ).nickname;
    const loser_nickname = (
      await this.profileService.getUserProfileById(loser_id)
    ).nickname;
    this.server
      .to((await this.connectedPlayerService.getPlayer(winner_id)).socketId)
      .emit('endGame', winner_nickname, loser_nickname, () => {});
    // this.logger.log(`${winner_id}에게 결과를 ${(await this.connectedPlayerService.getPlayer(winner_id)).socketId}`);
    if (normal_end === true) {
      this.server
        .to((await this.connectedPlayerService.getPlayer(loser_id)).socketId)
        .emit('endGame', winner_nickname, loser_nickname, () => {});
      // this.logger.log(`${loser_id}에게 결과를 ${(await this.connectedPlayerService.getPlayer(loser_id)).socketId}`);
    }
  }

  async endGame(match_id: number, loser_id: number) {
    try {
      const gameField = await this.getGameFieldByMatchId(match_id);
      await clearInterval(gameField.gameTimer);
      const match = await this.matchService.getByMatchId(match_id);
      let winner_id = 0;

      this.logger.log(
        `endGame : ${match_id} match finished by [ ${loser_id} ].`,
      );

      if (loser_id) {
        this.logger.log(`[ ${loser_id} ]가 비정상적으로 게임을 종료했구나`);
        if (match.playerLeft === loser_id) {
          await this.historyService.create(
            match.playerRight,
            match.playerLeft,
            match.scoreRight,
            match.scoreLeft,
          );
          winner_id = await match.playerRight;
          await this.updateProfile(winner_id, loser_id, match_id);
        } else {
          await this.historyService.create(
            match.playerLeft,
            match.playerRight,
            match.scoreLeft,
            match.scoreRight,
          );
          winner_id = await match.playerLeft;
          await this.updateProfile(winner_id, loser_id, match_id);
        }

        await this.sendMatchResult(winner_id, loser_id, false);
        this.matchService.deleteByMatchId(match.match_id);
        this.endPlayer(
          (await this.connectedPlayerService.getPlayer(winner_id)).socketId,
          winner_id,
        );
        return;
      }

      if (match.scoreLeft > match.scoreRight) {
        this.historyService.create(
          match.playerLeft,
          match.playerRight,
          match.scoreLeft,
          match.scoreRight,
        );
        winner_id = match.playerLeft;
        loser_id = match.playerRight;
        this.updateProfile(winner_id, loser_id, match_id);
      } else {
        this.historyService.create(
          match.playerRight,
          match.playerLeft,
          match.scoreRight,
          match.scoreLeft,
        );
        winner_id = match.playerRight;
        loser_id = match.playerLeft;
        this.updateProfile(winner_id, loser_id, match_id);
      }

      await this.sendMatchResult(winner_id, loser_id, true);
      await this.matchService.deleteByMatchId(match.match_id);
      this.endPlayer(
        (await this.connectedPlayerService.getPlayer(winner_id)).socketId,
        winner_id,
      );
      this.endPlayer(
        (await this.connectedPlayerService.getPlayer(loser_id)).socketId,
        loser_id,
      );
    } catch (error) {
      tryCatchLogger.error(`endGame : ${error.message}`);
    }
  }

  async playGame(
    server: Server,
    match: MatchEntity,
    player1: Player,
    player2: Player,
    gameField: GameField,
  ) {
    try {
      // location of ball
      gameField.ballX += gameField.ballXvelocity;
      gameField.ballY += gameField.ballYvelocity;

      // collision with ball and top & bottom of canvas
      if (
        gameField.ballY + gameField.ballRadius > gameField.canvasHeight ||
        gameField.ballY - gameField.ballRadius < 0
      ) {
        gameField.ballYvelocity = -gameField.ballYvelocity;
      }

      // collision with ball and paddle
      const tempBall: Ball = {
        x: gameField.ballX,
        y: gameField.ballY,
        radius: gameField.ballRadius,
      };
      const tempPaddle: Paddle = {
        x: 0,
        y: 0,
        width: 10,
        height: 100,
      };
      if (gameField.ballX + gameField.ballRadius < gameField.canvasWidth / 2) {
        tempPaddle.x = gameField.paddleLeftX;
        tempPaddle.y = gameField.paddleLeftY;
      } else {
        tempPaddle.x = gameField.paddleRightX;
        tempPaddle.y = gameField.paddleRightY;
      }

      if (await collision(tempBall, tempPaddle)) {
        const collidePoint =
          (tempBall.y - (tempPaddle.y + tempPaddle.height / 2)) /
          (tempPaddle.height / 2);
        const angleRad = (Math.PI / 4) * collidePoint;
        const direction =
          tempBall.x + tempBall.radius < gameField.canvasWidth / 2 ? 1 : -1;

        gameField.ballXvelocity =
          direction * gameField.ballSpeed * Math.cos(angleRad);
        gameField.ballYvelocity = gameField.ballSpeed * Math.sin(angleRad);

        gameField.ballSpeed += 0.1;
      }

      // check score
      if (gameField.ballX - gameField.ballRadius < 0) {
        ++gameField.scoreRight;
        await this.matchService.updateRightScore(
          match.match_id,
          gameField.scoreRight,
        );

        if (gameField.scoreRight > 2) {
          this.endGame(match.match_id, null);
        }
        resetBall(gameField, -1);
      } else if (
        gameField.ballX + gameField.ballRadius >
        gameField.canvasWidth
      ) {
        ++gameField.scoreLeft;
        await this.matchService.updateLeftScore(match.match_id, gameField.scoreLeft);

        if (gameField.scoreLeft > 2) {
          this.endGame(match.match_id, null);
        }
        resetBall(gameField, 1);
      }

      //
      const data: CanvasChange = {
        ballX: gameField.ballX,
        ballY: gameField.ballY,
        veloX: gameField.ballXvelocity,
        veloY: gameField.ballYvelocity,
        ballSpeed: gameField.ballSpeed,
        leftScore: gameField.scoreLeft,
        rightScore: gameField.scoreRight,
        ballRadius: gameField.ballRadius,
      };

      server.to(player1.socketId).emit('updateCanvas', data);
      server.to(player2.socketId).emit('updateCanvas', data);
    } catch (error) {
      tryCatchLogger.error(`playGame : ${error.message}`);
    }
  }
}

async function collision(b: Ball, p: Paddle) {
  const paddleLocation = {
    top: p.y,
    bottom: p.y + p.height,
    left: p.x,
    right: p.x + p.width,
  };

  const ballLocation = {
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

async function resetBall(gameField: GameField, direction: number) {
  gameField.ballX = gameField.canvasWidth / 2;
  gameField.ballY = gameField.canvasHeight / 2;
  gameField.ballXvelocity = 6 * direction;
  gameField.ballYvelocity = 6;
  gameField.ballSpeed = 10;
}

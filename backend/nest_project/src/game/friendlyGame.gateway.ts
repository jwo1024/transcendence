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
// import { HistoryService } from './service/history.service';
// import { HistoryEntity } from './entities/history.entity';

import { Player } from './dto/player.dto';
import { ConnectedFriendlyPlayerService } from './service/connectedFriendlyPlayer.service';
// import { ConnectedFriendlyPlayerEntity } from './entities/connectedFriendlyPlayer.entity';
import { FriendlyPlayer } from './dto/friendlyPlayer.dto';
import { InvitationService } from './service/invitation.service';

// todo: ladder_game, friendly_game 이외의 네임스페이스 처리하는 코드 필요

// todo : cors 처리
@Injectable()
@WebSocketGateway({ namespace: 'friendly_game' })
export class FriendlyGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private logger = new Logger('FriendlyGameGateway');

  private gameFieldArr: GameField[];

  constructor(
    private connectedFriendlyPlayerService: ConnectedFriendlyPlayerService,
    private profileService: ProfileService,
    private matchService: MatchService,
    private invitationSercive: InvitationService,
  ) {
    this.gameFieldArr = [];
  }

  @WebSocketServer()
  server: Server;

  async onModuleInit() {
    this.connectedFriendlyPlayerService.deleteAll();
    this.matchService.deleteAll();
    this.invitationSercive.deleteAll();
  }

  async handleConnection(socket: Socket) {
    this.logger.log(
      `Friendly Game Server: socketId [ ${socket.id} ] connected.`,
    );
    const token = socket.handshake.headers.authorization;

    // //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
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

    const current = await this.connectedFriendlyPlayerService.createPlayer(
      userId,
      socket.id,
    );
    if (!current) {
      return socket.disconnect();
    }
    const tempPlayer =
      await this.invitationSercive.updatePlayerByInvitation(current);
    if (!tempPlayer) {
      this.logger.log(
        `이럴 일은 거의 없겠지만 [ ${current.id} ]는 호스트도 게스트도 아니네.`,
      );
      return socket.disconnect();
    }
    this.logger.log(
      `호스트인지 게스트인지 모르겠지만 데이터 업데이트 시도 [ ${current.id} ].`,
    );
    // socket.emit('savePlayer', async (inviteData) => {
    // 	await this.connectedFriendlyPlayerService.updateInvitation(current, inviteData);
    // });
    this.profileService.ingame(userId);
    this.logger.log(`current Player : ${current.id}, ${current.socketId}`);
    this.logger.log(`current Player's data :`);
    // todo:
    const data = JSON.stringify(current);
    this.logger.log(`${data}`);

    if (await this.connectedFriendlyPlayerService.isHostPlayer(current)) {
      this.waitGame(current);
    } else if (
      await this.connectedFriendlyPlayerService.isGuestPlayer(current)
    ) {
      this.acceptGame(current);
    } else {
      this.logger.log(`handleConnection: not host, not guest`);
      this.profileService.logOn(socket.data.userId);
      return socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    // socket.emit('Error', new UnauthorizedException());

    if (
      await this.connectedFriendlyPlayerService.getPlayerBySocketId(socket.id)
    ) {
      const player =
        await this.connectedFriendlyPlayerService.getPlayerBySocketId(
          socket.id,
        );
      this.logger.log(`[ ${socket.id} ]로 찾은 플레이어 [ ${player.id} ]`);

      if (!(await this.matchService.getByPlayerId(player.id))) {
        this.logger.log(`[ ${player.id} ] 플레이어는 게임을 하고 있진 않아..`);
        await this.connectedFriendlyPlayerService.deletePlayer(player.id);
        this.profileService.logOn(socket.data.userId);
        socket.disconnect();
        return;
      } else {
        const match_id = (await this.matchService.getByPlayerId(player.id))
          .match_id;
        this.logger.log(
          `${player.id}는 ${match_id} 매치를 하다가 튕겼나봄 끝내주자`,
        );
        if (match_id) {
          await this.endGame(match_id, player.id);
        }
        await this.connectedFriendlyPlayerService.deletePlayer(player.id);
        this.profileService.logOn(socket.data.userId);
        socket.disconnect();
        return;
      }
    }

    if (
      !(await this.connectedFriendlyPlayerService.getPlayerBySocketId(
        socket.id,
      ))
    ) {
      this.logger.log(`[ ${socket.id} ]로 찾아도 플레이어 없음`);
      this.profileService.logOn(socket.data.userId);
      socket.disconnect();
      return;
    }
  }

  private async endPlayer(socket_id: string, player_id: number) {
    // socket.emit('Error', new UnauthorizedException());
    const hostOrNot = await this.connectedFriendlyPlayerService.isHostPlayer(
      await this.connectedFriendlyPlayerService.getPlayer(player_id),
    );
    if (hostOrNot === true) {
      this.logger.log(
        `endPlayer : [ ${player_id} ] 이제 갈거니까 초대 디비도 삭제할게~`,
      );
      await this.invitationSercive.deleteByHostId(player_id);
    }
    this.server.in(socket_id).disconnectSockets(true);
    this.logger.log(
      `Friendly Game Server: socketId [ ${player_id} -> ${socket_id} ] disconnected.`,
    );
  }

  private async checkRefuse(host: FriendlyPlayer, waitTime: number) {
    if (host.refuseGame === true) {
      this.logger.log(`checkRefuse : [ ${host.id} ] 는 거절당했어`);
      clearInterval(host.checkTimer);
      this.endPlayer(host.socketId, host.id);
    }
    const nowTime = Date.now();
    if (nowTime - waitTime > 35000) {
      // 35 seconds
      this.logger.log(
        `checkRefuse : [ ${host.id} ] 는 너무 오래 기다렸어 나갈래`,
      );
      clearInterval(host.checkTimer);
      this.endPlayer(host.socketId, host.id);
    }
  }

  private async waitGame(host: FriendlyPlayer) {
    this.logger.log(
      `waitGame : [ ${host.id} === ${host.hostId} ] 는 게임하고 싶어`,
    );
    const currentTime = Date.now();
    host.checkTimer = setInterval(
      () => this.checkRefuse(host, currentTime),
      1000,
    ) as unknown as number;
  }

  private async acceptGame(guest: FriendlyPlayer) {
    this.logger.log(
      `acceptGame : [ ${guest.id} ] 는 같이 게임하고 싶어서 들어왔어`,
    );
    // 초대 디비에 수락 여부 요소를 만든다 -> 여기서 수락 여부를 트루로 바꿔준다 -> 호스트는 이걸 계속 감지하고 있다가 시작해라
    this.server.to(guest.socketId).emit('guestArrive', (check) => {
      this.logger.log(
        `acceptGame ok! : [ ${check} ] 프론트한테 알려주고 왔어!`,
      );
    });
  }

  @SubscribeMessage('chooseGameType')
  async setGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() gameType: string,
  ) {
    this.logger.log(
      `setGame : ${socket.id} 는 ${gameType} 으로 초대에 응하겠어!`,
    );
    const host = await this.connectedFriendlyPlayerService.getHostbySocketId(
      socket.id,
    );
    const guest = await this.connectedFriendlyPlayerService.getPlayerBySocketId(
      socket.id,
    );
    if (!host) {
      this.endPlayer(socket.id, guest.id);
      return;
    }
    this.logger.log(
      `setGame : 내가 이 구역의 호스트 ${host.id}고 넌 게스트 ${guest.id}야.`,
    );
    const currentMatch = await this.matchService.createCustom(
      host.id,
      // guest.hostId,
      guest.id,
      gameType,
    );
    this.logger.log(
      `setGame : 게임하고 싶은데 ${currentMatch}가 만들어졌을까..`,
    );
    if (!currentMatch) {
      this.endPlayer(socket.id, guest.id);
      return;
    }
    // clearInterval(host.checkTimer);
    this.logger.log(
      `setGame : match ${currentMatch.match_id} will soon start!`,
    );
    this.startGame(currentMatch);
  }

  async startGame(match: MatchEntity) {
    try {
    const player1 = await this.connectedFriendlyPlayerService.getPlayer(
      match.playerLeft,
    );
    const player2 = await this.connectedFriendlyPlayerService.getPlayer(
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

    // const profile1 = await this.profileService.getUserProfileById(match.playerLeft);
    // const profile2 = await this.profileService.getUserProfileById(match.playerRight);

    this.server.to(player1.socketId).emit('setMiniProfile', profile1, profile2);
    this.server.to(player2.socketId).emit('setMiniProfile', profile1, profile2);

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

    if (match.game_type === 'speedUp') {
    gameField.ballSpeed = 20;
    } else if (match.game_type === 'smallBall') {
    gameField.ballRadius = 5;
    }

    this.logger.log(
      `friendly/startGame : ${match.match_id} -> ${player1.id} vs ${player2.id}`,
    );
    this.gameFieldArr.push(gameField);
    gameField.gameTimer = setInterval(() => {
      this.playGame(this.server, match, player1, player2, gameField);
    }, 20);
  } catch (error) {
    this.logger.error(`startGame : ${error.message}`);
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
    const player =
      await this.connectedFriendlyPlayerService.getPlayerBySocketId(socket.id);
    if (!player) return;
    const match = await this.matchService.getByPlayerId(player.id);
    const opponent = await this.matchService.getOpponentByPlayerIdFriend(
      match.match_id,
      player.id,
    );
    if (!opponent) return;
    // const opponent = await this.connectedFriendlyPlayerService.getPlayer(player.guestId);
    //
    // const player = await this.connectedFriendlyPlayerService.getPlayer(opponent.hostId);
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
      .to(
        (await this.connectedFriendlyPlayerService.getPlayer(winner_id))
          .socketId,
      )
      .emit('endGame', winner_nickname, loser_nickname, () => {});
    if (normal_end == true) {
      this.server
        .to(
          (await this.connectedFriendlyPlayerService.getPlayer(loser_id))
            .socketId,
        )
        .emit('endGame', winner_nickname, loser_nickname, () => {});
    }
  }

  async endGame(match_id: number, loser_id: number) {
    const gameField = await this.getGameFieldByMatchId(match_id);
    await clearInterval(gameField.gameTimer);
    const match = await this.matchService.getByMatchId(match_id);
    let winner_id = 0;

    this.logger.log(`endGame : ${match_id} match finished by [ ${loser_id} ].`);

    if (loser_id) {
      this.logger.log(`[ ${loser_id} ]가 비정상적으로 게임을 종료했구나`);
      if (match.playerLeft === loser_id) {
        winner_id = match.playerRight;
      } else {
        winner_id = match.scoreLeft;
      }

      await this.sendMatchResult(winner_id, loser_id, false);
      this.matchService.deleteByMatchId(match.match_id);
      this.endPlayer(
        (await this.connectedFriendlyPlayerService.getPlayer(winner_id))
          .socketId,
        winner_id,
      );
      return;
    }

    if (match.scoreLeft > match.scoreRight) {
      winner_id = match.playerLeft;
      loser_id = match.scoreRight;
    } else {
      winner_id = match.playerRight;
      loser_id = match.playerLeft;
    }

    await this.sendMatchResult(winner_id, loser_id, true);
    await this.matchService.deleteByMatchId(match.match_id);
    this.endPlayer(
      (await this.connectedFriendlyPlayerService.getPlayer(winner_id)).socketId,
      winner_id,
    );
    this.endPlayer(
      (await this.connectedFriendlyPlayerService.getPlayer(loser_id)).socketId,
      loser_id,
    );
  }

  async playGame(
    server: Server,
    match: MatchEntity,
    player1: Player,
    player2: Player,
    gameField: GameField,
  ) {
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
      await this.matchService.updateRightScore(match.match_id, gameField.scoreRight);

      if (gameField.scoreRight > 2) {
        this.endGame(match.match_id, null);
      }
      if (match.game_type === 'speedUp')
        resetBall(gameField, 20, -1);
      else resetBall(gameField, 10, -1);
    } else if (gameField.ballX + gameField.ballRadius > gameField.canvasWidth) {
      ++gameField.scoreLeft;
      await this.matchService.updateLeftScore(match.match_id, gameField.scoreLeft);

      if (gameField.scoreLeft > 2) {
        this.endGame(match.match_id, null);
      }
      if (match.game_type === 'speedUp')
        resetBall(gameField, 20, 1);
      else resetBall(gameField, 10, 1);
    }

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

async function resetBall(
  gameField: GameField,
  speed: number,
  direction: number,
) {
  gameField.ballX = gameField.canvasWidth / 2;
  gameField.ballY = gameField.canvasHeight / 2;
  gameField.ballXvelocity = 6 * direction;
  gameField.ballYvelocity = 6;
  gameField.ballSpeed = speed;
}

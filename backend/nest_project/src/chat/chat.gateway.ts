import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { 
        SubscribeMessage,
        WebSocketGateway,
        WebSocketServer,
        OnGatewayConnection,
        OnGatewayDisconnect,
        MessageBody, 
        ConnectedSocket
      } from '@nestjs/websockets';
import { 
          OnModuleInit,
          UnauthorizedException 
        } from '@nestjs/common';

import { roomType } from './types/roomTypes';
import { RoomI } from './interfaces/room.interface';
import { RoomService } from './services/room/room.service';
import { UserI } from './interfaces/user.interface';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

// @WebSocketGateway({ namespace: '/chat', cors: { origin: "http://localhost:3001", "*" } })
@WebSocketGateway({ namespace: '/chat', cors: { origin: "*"} })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit 
{
  private logger = new Logger('EventsGateway'); // Logger 인스턴스를 생성

  @WebSocketServer() server: Server;

  constructor(
    //     // private authService: AuthService,
    //     // private userService: UserService,
      private roomService: RoomService,
      private readonly userRepository: Repository<UserEntity>,

    //     // private connectedUserService: ConnectedUserService,
    //     // private joinedRoomService: JoinedRoomService,
    //     // private messageService: MessageService
        ) { }
  
  //required by OnModuleInit
  async onModuleInit() {
    // await this.connectedUserService.deleteAll();
    // await this.joinedRoomService.deleteAll();
  }

  //required by OnGatewayConnection
  async handleConnection(socket: Socket) {
    try {
      //인증 관련 부분
      // const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      // const user: UserI = await this.userService.getOne(decodedToken.user.id);
      // if (!user) {
        // return this.disconnect(socket);
      // } else {

        const user
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        // substract page -1 to match the angular material paginator
        // rooms.meta.currentPage = rooms.meta.currentPage - 1;
        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      } catch {
      return this.disconnect(socket);
    }
  }

  //required by OnGatewayDisconnection
  async handleDisconnect(socket: Socket) {
    // // remove connection from DB
    // await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

    private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }


  //--------메서드 시작
  @SubscribeMessage('chatMessage')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`Received message: ${payload}`); // 로그를 출력합니다.
    this.logger.log(`Received message`); // 로그를 출력합니다.
    this.server.emit('chatMessage', payload);
  }

  @SubscribeMessage('Room-create')
  async chatRoomCreate(socket: Socket, room: RoomI)
      // @ConnectedSocket() socket: Socket,
      // @MessageBody(){
      //   room_name,
      //   room_type,
      //   room_pass,
      // }: {
      //   room_name: string;
      //   room_type: room_type;
      //   room_pass: string;
      // }
      // )
  {
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);

  }
}


// // @WebSocketGateway({namespace: "chat", cors: { origin: "http://localhost:3001" } })
// @WebSocketGateway({ namespace: "chat", cors: { origin: "*"} })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit 
// {
//   @WebSocketServer()
//   server: Server;

//   constructor(
//     // private authService: AuthService,
//     // private userService: UserService,
//     // private roomService: RoomService,
//     // private connectedUserService: ConnectedUserService,
//     // private joinedRoomService: JoinedRoomService,
//     // private messageService: MessageService
//     ) { }

//   //required by OnModuleInit
//   async onModuleInit() {
//     // await this.connectedUserService.deleteAll();
//     // await this.joinedRoomService.deleteAll();
//   }

//   //required by OnGatewayConnection
//   async handleConnection(socket: Socket) {
//     // try {
//     //   const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
//     //   const user: UserI = await this.userService.getOne(decodedToken.user.id);
//     //   if (!user) {
//     //     return this.disconnect(socket);
//     //   } else {
//     //     socket.data.user = user;
//     //     const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
//     //     // substract page -1 to match the angular material paginator
//     //     rooms.meta.currentPage = rooms.meta.currentPage - 1;
//     //     // Save connection to DB
//     //     await this.connectedUserService.create({ socketId: socket.id, user });
//     //     // Only emit rooms to the specific connected client
//     //     return this.server.to(socket.id).emit('rooms', rooms);
//     //   }
//     // } catch {
//       // return this.disconnect(socket);
//     // }
//   }

//   //required by OnGatewayDisconnection
//   async handleDisconnect(socket: Socket) {
//     // // remove connection from DB
//     // await this.connectedUserService.deleteBySocketId(socket.id);
//     socket.disconnect();
//   }

//   // private disconnect(socket: Socket) {
//   //   socket.emit('Error', new UnauthorizedException());
//   //   socket.disconnect();
//   // }

//   @SubscribeMessage('events')
//   handleEvent(@MessageBody() data: string): string {
//     this.server.emit('localhost:3000/rooms', data);
//   return data;
// } //events 테스트 실패

// }

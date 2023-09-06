//Modules
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
import { Repository } from 'typeorm';

//Types
// import { roomType } from './types/roomTypes';

//Entities
import { UserEntity } from './entities/user.entity';

//Interfaces
import { RoomI } from './interfaces/room.interface';
import { UserI } from './interfaces/user.interface';
import { ConnectedUserI } from './interfaces/connected-user.interface';
import { MessageI } from './interfaces/message.interface';
import { JoinedRoomI } from './interfaces/joined-room.interface';

//Injected Services
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { ConnectedUserService } from './services/connected-user/connected-user.service';
import { JoinedRoomService } from './services/joined-room/joined-room.service';
import { MessageService } from './services/message/message.service';

//temp - profile
import { ProfileService } from './services/profile-service/profile-service.service';
import { SignupDto } from './dto/signup.dto';



// @WebSocketGateway({ namespace: '/chat', cors: { origin: "http://localhost:3001", "*" } })
@WebSocketGateway({ namespace: '/chat', cors: { origin: "*"} })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit 
{
  @WebSocketServer() server: Server;
  
  private logger = new Logger('for Chat'); // Logger 인스턴스를 생성

  constructor(
    //     // private authService: AuthService,
      private userService: UserService,
      private roomService: RoomService,
      // private userRepository: Repository<UserEntity>,
      // private readonly userRepository: Repository<UserEntity>,
      private profileService : ProfileService,
      private connectedUserService: ConnectedUserService,
      private joinedRoomService: JoinedRoomService,
      private messageService: MessageService
        ) { };
  
  //required by OnModuleInit
  async onModuleInit() {
    // await this.connectedUserService.deleteAll();
    // await this.joinedRoomService.deleteAll();
  };

  //required by OnGatewayConnection
  async handleConnection(socket: Socket) {
    try {
      //인증 관련 부분(토큰 및 user 정보 socket에 주입 )
      // const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      // const user: UserI = await this.userService.getOne(decodedToken.user.id);
      // if (!user) {
        // return this.disconnect(socket);
      // } else {
    this.logger.log(`Try connection: ${socket.id}`); 
      
      // //temp profile for test
      //   const tempProfile: SignupDto = new SignupDto();
      //   tempProfile.id = 1234;
      //   tempProfile.nickname = 'surlee';
      //   tempProfile.enable2FA = false;
      //   tempProfile.data2FA = '';

        //여기서 만드려고 하니까 오류남. 원래도 chat 진입전 Userprofile에 대응하는 데이터가 있을 것.
        // const profileUser = await this.profileService.signUp(tempProfile) 
        // const user

    this.logger.log(`before make temp profile `); 

        //temp UserI
        const tempProfile: UserI = {
          id: 12344,
          nickname: 'surlee',
          block_list: [],
          friend_list: [],
          rooms: [],
          connections: [],
          joinedRooms: [],
          messages: [],
        };

      this.logger.log(`before create db `); 

        //원래 로직은 만드는 것이 아닌, getOne으로 찾아와야 하나 일단 임시
        const user: UserI = await this.userService.create(tempProfile);
        // const user: UserI = await this.userService.getOne(tempProfile.id);
        this.logger.log(`create User: ${tempProfile.id}, ${tempProfile.nickname}`); 
        // const user: UserI = await this.userService.getOne(decodedToken.user.id);
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        
        // substract page -1 to match the angular material paginator
        // rooms.meta.currentPage = rooms.meta.currentPage - 1;
        
       this.logger.log(`save to DB : ${socket.id}, ${user}`); 

        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });
        
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      } catch {
       this.logger.log(`error occur`); 
      return this.disconnect(socket);
    }
  }

  //required by OnGatewayDisconnection
  async handleDisconnect(socket: Socket) {
    // // remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

    private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  };

  @SubscribeMessage("server-log")
	ServerLog(
		@ConnectedSocket() socket: Socket,
		@MessageBody() message: string 
    )
  {
		this.logger.error(`${socket.id}: `, message);
	}

  //--------메서드 시작-------------------------

//chatRoomCreate parameter 초안
  // (
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

  //For Room
  @SubscribeMessage('Room-create')
  async chatRoomCreate(socket: Socket, room: RoomI)
  {
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);

    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
      // substract page -1 to match the angular material paginator
      // rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }

  }
  
  @SubscribeMessage('Room-join')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessagesForRoom(room, { limit: 10, page: 1 });
    // messages.meta.currentPage = messages.meta.currentPage - 1;
    
    // Save Connection to Room
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
    
    // Send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }
  
  @SubscribeMessage('Room-leave')
  async onLeaveRoom(socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

   // @SubscribeMessage('chatMessage')
  // handleMessage(client: Socket, payload: any): void {
  //   this.logger.log(`Received message: ${payload}`); // 로그를 출력합니다.
  //   this.logger.log(`Received message`); // 로그를 출력합니다.
  //   this.server.emit('chatMessage', payload);
  // }

  @SubscribeMessage('Message-add')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({...message, user: socket.data.user});
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.roomId);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);

    // TODO: Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

}
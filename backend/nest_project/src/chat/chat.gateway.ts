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
// import { RoomEntity } from './entities/room.entity';

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
// import { SignupDto } from './dto/signup.dto';

//DTOs
import { RoomCreateDTO, RoomJoinDTO } from './dto/room.dto';
import { RoomEntity } from './entities/room.entity';
import { MessageDTO } from './dto/message.dto';


// @WebSocketGateway({ namespace: '/chat', cors: { origin: "http://localhost:3001", "*" } })
@WebSocketGateway({ namespace: '/chat', cors: { origin: "*"} })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit 
{
  @WebSocketServer() server: Server;
  
  private logger = new Logger('Chat');

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
    await this.joinedRoomService.deleteAll();
    await this.connectedUserService.deleteAll();
    await this.userService.deleteAll();
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
        const tempUser: UserI = {
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
        const user: UserI = await this.userService.create(tempUser);
        // const user: UserI = await this.userService.getOne(tempUser.id);
        this.logger.log(`create User: ${tempUser.id}, ${tempUser.nickname}`); 
        this.logger.log(`returned User: ${user.id}, ${user.nickname}`); 
        // const user: UserI = await this.userService.getOne(decodedToken.user.id);
        socket.data.user = user;

        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        
        // substract page -1 to match the angular material paginator
        // rooms.meta.currentPage = rooms.meta.currentPage - 1;
        this.logger.log(`load from DB : "${rooms.items}"`); 
        
        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });
        this.logger.log(`saved to DB : ${socket.id}, ${user}`); 
        
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
    // this.logger.log(`userid : ${socket.data.user.id}`);
    await this.userService.deleteById(socket.data.user.id);
    socket.disconnect();
  }

    private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  };

  @SubscribeMessage("socketId & message")
	ServerLog(
		@ConnectedSocket() socket: Socket,
		@MessageBody() message: string 
    )
  {
		this.logger.error(`${socket.id}: `, message);
	}

  //--------메서드 시작-------------------------

  //For Room
  @SubscribeMessage('Room-create')
  async chatRoomCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() room:RoomCreateDTO)
        // room:RoomCreateDTO) 
  {
    this.logger.log(`Room-create called : ${room} , ${room.roomName} ${room.roomType}`);
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    this.logger.log(`after call : ${createdRoom.roomName} , ${createdRoom.roomOwner} ${createdRoom.roomId}`);

    //방을 만든 사용자를 생성된 방에 join 시킴
    this.onJoinRoom(socket, {roomId: createdRoom.roomId, roomPass: createdRoom.roomPass});

    //현 서버에 소켓 연결된 모든 채팅 사용자에게 room 정보를 보냄
    for (const user of createdRoom.users) {

      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });

      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }

    }
  }
  

  @SubscribeMessage('Room-join')
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: RoomJoinDTO) {
   if ( !(this.roomService.isRoomExist(room.roomId)))
    {
      //존재하지 않는 roomId 요청일 경우 무시
      return ;
    }
  // this.logger.log("RoomJoin:-start---------")
  // this.logger.log(`exist : ${await this.roomService.isRoomExist(room.roomId)}`)
   const roomFromDB = this.roomService.getRoom(room.roomId);
  this.logger.log(`1. roomFromDB : ${(await roomFromDB).roomName}, ${(await roomFromDB).roomOwner}`)
   if (!(this.roomService.isValidForJoin(await roomFromDB, room)))
   {
    //roomType이 protected일 경우 비밀번호가 맞아도 초대된 사용자가 아니면 못들어감(무시)
    //roomType이 private인 경우, 비밀번호가 맞지 않으면 못들어감(무시)
    return ;
   }

   //join process -> 이전대화 불러와서 새로 들어온 사용자에게 보내주기.
    const messages = 
      await this.messageService.findMessagesForRoom(
        await roomFromDB, { limit: 10, page: 1 }
        );
      // messages.meta.currentPage = messages.meta.currentPage - 1;
      this.logger.log(`messages : ${messages.items}, ${messages.meta.itemCount}`);
      // Save Connection to Room
    const temp =  await this.joinedRoomService.create(
        { socketId: socket.id, user: socket.data.user, room: await roomFromDB });
    this.logger.log(`2-1. Joined obj : ${temp.room.roomName}, ${temp.socketId}, ${temp.user.nickname}, ${temp.id}`)
    // this.logger.log(`2-2. Joined in room : ${await roomFromDB.joinedUsers}`)
      
    // Send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }
  
  @SubscribeMessage('Room-leave')
  async onLeaveRoom( @ConnectedSocket() socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }
  
  //--- 아직 구현 안한 쪽

   // @SubscribeMessage('chatMessage')
  // handleMessage(client: Socket, payload: any): void {
  //   this.logger.log(`Received message: ${payload}`); // 로그를 출력합니다.
  //   this.logger.log(`Received message`); // 로그를 출력합니다.
  //   this.server.emit('chatMessage', payload);
  // }


  //현재 방 정보만 가져오는 메서드가 필요할 듯 하다.
  //유저 정보 변동, 방 정보 변동시 마다 호출되는 용도.
  // @SubscribeMessage('Rooms-get') 
  // async onPaginateRoom(socket: Socket) {
  //   return this.server.to(socket.id).emit('rooms', rooms);
  // }

  @SubscribeMessage('Message-add')
  async onAddMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messageDTO: MessageDTO) {
    
    if ( !(this.roomService.isRoomExist(messageDTO.roomId)))
    {
      //존재하지 않는 roomId 요청일 경우 무시
      return ;
    }

    const createdMessage: MessageI 
      = await this.messageService.create(messageDTO, socket.data.user);
    const room: RoomI 
      = await this.roomService.getRoom(createdMessage.room.roomId);
    const joinedUsers: JoinedRoomI[] 
      =  await this.joinedRoomService.findByRoom(room);

    // TODO: Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) 
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
  }
}

//그룹 채팅 -> 화면에서 나가는 순간 room-leave, 방과 socket 연결을 끊는다.
//DM -> 지금 구현 대로라면 따로 구현하지 않아도, 상대방 사용자가 onChat 상태가 아닐때도 메세지를 보낼 수 있으며, 
// 상대방이 chat 상태가 되었을때 DM의 내용들을 확인할 수 있을 것 같다.(DB 덕분.)
// 상대방 사용자의 현상태를 반영해서 DM을 보낼 수 있고 없고의 경우를 나누는게 오히려 로직이 복잡해 지지 않을까함.
// ->사용자의 현 상태를 매번 userProfile에서 조회해야 하기 때문.

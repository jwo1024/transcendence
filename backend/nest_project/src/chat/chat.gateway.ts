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
import { RoomEntity } from './entities/room.entity';

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
import { MessageDTO } from './dto/message.dto';
import { AdminRelatedDTO } from './dto/room.dto';


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

  //For Room(단체 채팅방 만들기용 메서드)
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
  
  //For DM(개인 채팅용 방 만들기 메서드)
  @SubscribeMessage('DM-create')
  async chatDMCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() room:RoomCreateDTO, @MessageBody() userNickname: string)
        // room:RoomCreateDTO) 
  {
    if (room.roomType != 'dm')
    {
      return ; //dm룸 만드는 명령이 아닌 경우 무시
    }
    const userTheOther = await this.userService.findOneByNickname(userNickname);
    if ( userTheOther === undefined)
    {
      return ; //valid하지 않은 사용자 nickname을 넘긴경우 무시
    }

    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);

    //방을 만든 사용자를 생성된 방에 join 시킴()
    await this.joinedRoomService.create(
      { socketId: socket.id, user: socket.data.user, room: createdRoom });
    
    //초대할 상대방 소켓 정보 가져오기
    const socketTheOther = await this.connectedUserService.findByUser(userTheOther);
    if (socketTheOther === undefined)
    {
      this.deleteRoom(createdRoom.roomId); //만든 방 삭제

      // ++ joinedRoom entity(216번줄 생성)은 위의 room 지우면서 자동으로 사라질것으로 예상하나 테스트 후 아니라면 삭제 코드 작성
      
      return ;//상대방이 연결된 상태가 아닐때 dm 못 만듬.
    }

    //상대방 사용자를 초대
    await this.joinedRoomService.create(
      { socketId: socketTheOther.socketId, user: socketTheOther.user, room: createdRoom });
    
    //상대방과 나에게 현재 만들어진 room 정보를 포함해 전체 Joinedroom 보냄
    this.emitAllRoomsToUsersInRoom(createdRoom.roomId);
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

  private async deleteRoom(roomId:number)
  {
    await this.roomService.deleteById(roomId);
  }
  
  @SubscribeMessage('Room-leave')
  async onLeaveRoom( @ConnectedSocket() socket: Socket, @MessageBody() roomId: number) {
    // remove connection from JoinedRooms
    const roomToleave = await this.roomService.getRoom(roomId);
    const userId = socket.data.user.id
    if (!roomToleave)
      return ;
    this.joinedRoomService.deleteBySocketId(socket.id);
    roomToleave.users = roomToleave.users.filter(toreduce => toreduce.id ===  userId);
    if (roomToleave.users.length === 0)
      this.deleteRoom(roomId);
    //dm에서는 room-leave를 부르지 않는다.
  }
  
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

    // Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) 
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
  }
  
  //-------방 정보 보내주기------------

  private async emitRoomsToAllConnectedUser()
  {
    //소켓 연결된 모든 유저들에게 현재 만들어져 있는 방 보여주기.
    const connectedUsers : ConnectedUserI[] = await this.connectedUserService.getAllUser();
    for (const connetedUser of connectedUsers) 
    {

      const rooms = await this.roomService.getRoomsByType(['open', 'protected']); //roomType이 DM, private 이 아닌 애들만.
      // const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        await this.server.to(connetedUser.socketId).emit('visible_rooms', rooms);
    }
  } 

  private async emitOneRoomToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    const joinedUsers: JoinedRoomI[] 
      =  await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) 
      await this.server.to(user.socketId).emit('current-room', room);
  }

    //현재방(roomId)에 속한 모든 유저들에게, 각 유저가 속한 모든 방 목록 보내기
  private async emitAllRoomsToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    const joinedUsers: JoinedRoomI[] 
      =  await this.joinedRoomService.findByRoom(room);
      for (const user of joinedUsers) 
    {
      await this.server.to(user.socketId).emit('me-joining-rooms', user.room);
    }
  }
 //----------------------------------

  @SubscribeMessage('Owner-Room-edit')
  async onEditRoomByOwner(
    @ConnectedSocket() socket: Socket,
    @MessageBody() editData: RoomCreateDTO, @MessageBody() roomId: number ) 
  {
      if ( await this.roomService.isRoomOwner(socket.data.user.userId, roomId) === false)
        return ; //주인장이 아닌 사람이 한 요청일때 무시
      const editedRoom = await this.roomService.editRoom(roomId, editData);

      // for (const user of createdRoom.users) {

      //   const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      //   const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
  
      //   for (const connection of connections) {
      //     await this.server.to(connection.socketId).emit('rooms', rooms);
      //   }
  
      // }
      // if (editedRoom.roomType === 'open' || editedRoom.roomType === 'protected')
      //private으로 바뀐 경우, 모든 유저의 채팅 목록에서 사라져야한다. 따라서 위의 if 절은 없앰.
      this.emitRoomsToAllConnectedUser();
  }
  
  @SubscribeMessage('Admin-add')
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO)
  {
    const amIAdmin = await this.roomService.isRoomAdmin(socket.data.user.userId, adminDto.roomId)
    if (amIAdmin === false)
      return;
    this.roomService.addAdmintoRoom(adminDto.roomId, adminDto.targetUserId);

    this.emitOneRoomToUsersInRoom(adminDto.roomId);
  }
    
  @SubscribeMessage('Admin-kick')
  async onKickSomeone(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO
  )
  {
    if (this.roomService.isRoomOwner(adminDto.targetUserId, adminDto.roomId))
      return ; //target이 주인장인 경우 무시
    if (socket.data.user.id === adminDto.targetUserId)
      return ; //본인을 퇴장시키는 경우 무시 //증말 싫다 이런 사용자.....ㅠ
    if (await this.roomService.isRoomAdmin(socket.data.user.id, adminDto.roomId) === false)
      return ; //요청한 user가 admin이 아닌 경우 무시
    

      //퇴장처리(onLeaveRoom과 겹치는 부분 리팩토링시 함수로 빼기

      const roomToleave = await this.roomService.getRoom(adminDto.roomId);
      if (!roomToleave)
        return ;
      const userId = adminDto.targetUserId;
      this.joinedRoomService.deleteBySocketId(socket.id);
      roomToleave.users = roomToleave.users.filter(toReduce => toReduce.id ===  userId);
      //admin-kick은 본인을 퇴장 시키는 경우는 없기에, 항상 1명 이상의 사용자가 방에 남아있게 된다.

      //현재 방 유저에게 현재 방 정보 제공
      this.emitOneRoomToUsersInRoom(adminDto.roomId);
    }


    
  
  //--- 아직 구현 안한 쪽

  //소켓이 끊기는 순간 handledissconnection에서 room-leave와 connected-socket 데이터 정리를 잘 해야함!!! 꼭 테스트 할것
    
    // @SubscribeMessage('chatMessage')
    // handleMessage(client: Socket, payload: any): void {
      //   this.logger.log(`Received message: ${payload}`); // 로그를 출력합니다.
      //   this.logger.log(`Received message`); // 로그를 출력합니다.
      //   this.server.emit('chatMessage', payload);
      // }

}
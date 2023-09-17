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
// import { OneToMany, Repository } from 'typeorm';

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
import { RoomCreateDTO, RoomJoinDTO, RoomInviteDTO, SimpleRoomDTO } from './dto/room.dto';
import { MessageDTO } from './dto/message.dto';
import { AdminRelatedDTO } from './dto/room.dto';

//Mappers
import { RoomMapper } from './mapper/room.mapper';

import * as jwt from 'jsonwebtoken';
import { create } from 'domain';


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
      private messageService: MessageService,
      private roomMapper: RoomMapper,
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
      // //인증 관련 부분(토큰 및 user 정보 socket에 주입 )
      // const token = socket.handshake.headers.authorization;
      // const userId = jwt.decode(token.split('Bearer ')[1])['userId'];

              // const decodedToken 
              // = await this.authService.verifyJwt(socket.handshake.headers.authorization);
              // const userProfile: UserI = await this.userService.getOne(decodedToken.user.id);
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

        const rooms = await this.roomService.getRoomsForUser(user.id);
        
        // substract page -1 to match the angular material paginator
        // rooms.meta.currentPage = rooms.meta.currentPage - 1;
        // this.logger.log(`load from DB : "${rooms.items}"`); 
        
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
    if(!createdRoom)
    { //방만들기 실패
      this.emitErrorEvent(socket.id, "the room is not exist now.")
      return ;
    }

    //방을 만든 사용자를 생성된 방에 join 시킴
    this.onJoinRoom(socket, {roomId: createdRoom.roomId, roomPass: createdRoom.roomPass});
    // 방을 만든 사용자에게 현재 방의 정보 제공 
    await this.server.to(socket.id).emit('new_join_room', createdRoom);
    // const currentRoomId = createdRoom.roomId;
    // await this.server.to(socket.id).emit(`messages_${currentRoomId}`, createdRoom);
    //현 서버에 소켓 연결된 모든 채팅 사용자에게 room 정보를 보냄
    for (const user of createdRoom.users)
    {

      const connection: ConnectedUserI = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id);

      // for (const connection of connections) { // 한 유저당 하나의 소켓만 들어온다고 가정하고 바뀐부분
        await this.server.to(connection.socketId).emit('rooms', rooms);
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
    //내가 블락한 상대일 경우 실패(일단은 무시)
    const currentBlockList = await (await this.userService.getOne(socket.data.user.id)).block_list;
    if (currentBlockList.find(finding => userTheOther.id))
    {
      return ;
    }
    //내가 블락된 상대일 경우 실패(일단은 무시)
    if (userTheOther.block_list.find(finding => socket.data.user.id))
    {
      return ;
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

  @SubscribeMessage('Room-invite')
  async onInviteRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomInvite: RoomInviteDTO) 
  {
    const userEntity = await this.userService.getOne(socket.data.user.id);
    //내가 차단한 유저 초대시 무시
    if (userEntity.block_list.find(finding => finding === roomInvite.targetUserId))
      return ;
    // 나를 차단한 유저에게 초대 안 보냄(무시)
    const targetEntity = await this.userService.getOne(roomInvite.targetUserId);
    if (targetEntity.block_list.find(finding => finding === userEntity.id))
      return ;
    
    // 현재 접속한 유저가 아닐 경우 초대 안 보냄
    const connection = targetEntity.connections;
    if (connection.length  === 0)
      return ; 
    
    // 타겟에게 초대 팝업 띄우기용 이벤트
    this.server.to(targetEntity.connections[0].socketId).emit("invite-to-chat", roomInvite.roomId);
  }


  @SubscribeMessage('Room-join')
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: RoomJoinDTO) 
  {
    if ( !(this.roomService.isRoomExist(room.roomId)))
      {
        this.emitErrorEvent(socket.id, "the room is not exist now.")
        return ;
      }
    if ( await this.roomService.isBannedUser(socket.data.user.id, room.roomId))
    {
      this.emitErrorEvent(socket.id, "this user is banned from the room.")
      return ; //ban 처리된 유저이면 요청 무시
    }
    const roomFromDB = this.roomService.getRoom(room.roomId);
    this.logger.log(`1. roomFromDB : ${(await roomFromDB).roomName}, ${(await roomFromDB).roomOwner}`)
    if (!( await this.roomService.isValidForJoin(await roomFromDB, room)))
    {
      this.emitErrorEvent(socket.id, "not valid password")
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
        
    //이벤트명 동적생성
      const currentRoomId = (await roomFromDB).roomId;
        this.logger.log(`messages_${currentRoomId}`);
      // Send last messages from Room to User
      await this.server.to(socket.id).emit(`messages_${currentRoomId}`, messages);
      // await this.server.to(socket.id).emit('messages${currentRoomId}', messages);
  }

  @SubscribeMessage('Room-enter')
  async onEnterRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: number) 
  {
    if ( await (this.roomService.isRoomExist(roomId)) === false)
      {
        //존재하지 않는 roomId 요청일 경우 무시
        return ;
      }
    if ( await this.roomService.isBannedUser(socket.data.user.id, roomId))
      return ; //ban 처리된 유저이면 요청 무시
    // this.logger.log("RoomJoin:-start---------")
    // this.logger.log(`exist : ${await this.roomService.isRoomExis.roomId)}`)
    const roomFromDB = this.roomService.getRoom(roomId);
   
    //DB에서 messages 불러와서 사용자에게 보내주기.
    const messages =     await this.messageService.findMessagesForRoom(
                              await roomFromDB, { limit: 10, page: 1 });

    await this.server.to(socket.id).emit('messages', messages);

    //이벤트명 동적생성
    const currentRoomId = (await roomFromDB).roomId;
    // Send last messages from Room to User
    await this.server.to(socket.id).emit(`messages_${currentRoomId}`, messages);
    
    this.emitOneRoomToOneUser(roomId, socket.id);
  }

  private async deleteRoom(roomId:number)
  {
    await this.roomService.deleteById(roomId);
  }
  
  private async changeOwner(room :RoomI)
  {
    if (room.roomAdmins.length > 0)
      room.roomOwner = room.roomAdmins[0];
    else
      room.roomOwner = room.users[0].id;
    await this.roomService.savechangedOwner(room);
  }

  @SubscribeMessage('Room-leave')
  async onLeaveRoom( @ConnectedSocket() socket: Socket, @MessageBody() roomId: number) {
    // remove connection from JoinedRooms
    const roomToleave = await this.roomService.getRoom(roomId);
    const userId = socket.data.user.id
    if (!roomToleave)
    {
      this.emitErrorEvent(socket.id, "the room is not exist now.")
      return ;
    }
    roomToleave.users = roomToleave.users.filter(toreduce => toreduce.id ===  userId);
    this.joinedRoomService.deleteBySocketId(socket.id);
    //주인장일 경우 계승하고 나감
    if (roomToleave.users.length === 0)
      this.deleteRoom(roomId);
    else
    {
      if (userId === roomToleave.roomOwner)
        this.changeOwner(roomToleave);
    }
    //dm에서는 room-leave를 부르지 않는다.
  }
  
  @SubscribeMessage('Message-add')
  async onAddMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messageDTO: MessageDTO) {
    
    if ( !(this.roomService.isRoomExist(messageDTO.roomId)))
    {
      //존재하지 않는 roomId 요청일 경우 무시
      this.emitErrorEvent(socket.id, "the room is not exist now.")
      return ;
    }

    const createdMessage: MessageI 
      = await this.messageService.create(messageDTO, socket.data.user);
    const room: RoomI 
      = await this.roomService.getRoom(createdMessage.room.roomId);
    const joinedUsers: JoinedRoomI[] 
      =  await this.joinedRoomService.findByRoom(room);

    // Send new Message to all joined Users of the room (currently online)
    const currentRoomId = room.roomId;
    
    for(const user of joinedUsers) 
      await this.server.to(user.socketId).emit(`messageAdded_${currentRoomId}`, createdMessage);
  }
  
  //-------방 정보 보내주기------------

  private async emitErrorEvent(socketId:string, reason: string)
  {
    await this.server.to(socketId).emit("failed-somthis", reason);
  }

  private async emitRoomsToAllConnectedUser()
  {
    //소켓 연결된 모든 유저들에게 현재 만들어져 있는 방 보여주기.
    const connectedUsers : ConnectedUserI[] = await this.connectedUserService.getAllUser();
    for (const connetedUser of connectedUsers) 
    {
      const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
      // const rooms = await this.roomService.getRoomsForUser(user.id);
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
    
    const currentRoomId = room.roomId; 
    for (const user of joinedUsers) 
      await this.server.to(user.socketId).emit(`current-room_${currentRoomId}`, room);
  }

  private async emitOneRoomToOneUser(roomId : number, socketId: string)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    await this.server.to(socketId).emit('current-room_${roomId}', room);
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
      const joiningrooms = user.user.rooms;
      await this.server.to(user.socketId).emit(
        'me-joining-rooms', 
        this.roomMapper.Create_simpleDTOArrays(joiningrooms)
        );
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

  private async onAdminMethods(roomId : number, meId : number, targetUserId : number) : Promise<boolean>
  {
    if (this.roomService.isRoomOwner(targetUserId, roomId))
    return false; //target이 주인장인 경우 무시
  if (meId === targetUserId)
    return false; //본인을 퇴장시키는 경우 무시 //증말 싫다 이런 사용자.....ㅠ
  if (await this.roomService.isRoomAdmin(meId, roomId) === false)
    return false; //요청한 user가 admin이 아닌 경우 무시
  }

  @SubscribeMessage('Admin-kick')
  async onKickSomeone(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO
  )
  {
    if (await this.onAdminMethods(adminDto.roomId, socket.data.user.id, adminDto.targetUserId) === false)
      return ;//무시 케이스들
    
      //퇴장처리(onLeaveRoom과 겹치는 부분 리팩토링시 함수로 빼기)
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

    @SubscribeMessage('Admin-Ban')
    async onBanSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO
    )
    {
      if (await this.onAdminMethods(adminDto.roomId, socket.data.user.id, adminDto.targetUserId) === false)
        return ; //무시 케이스들
      
      // target을 현재 방의 banlist에 추가
      const updatedRoom = await this.roomService.addUserToBanList(adminDto);

       //퇴장처리(onLeaveRoom과 겹치는 부분 리팩토링시 함수로 빼기)
       const roomToleave = await this.roomService.getRoom(adminDto.roomId);
       if (!roomToleave)
         return ;
       const userId = adminDto.targetUserId;
       this.joinedRoomService.deleteBySocketId(socket.id);
       roomToleave.users = roomToleave.users.filter(toReduce => toReduce.id ===  userId);

       //현재 방 유저에게 현재 방 정보 제공
      this.emitOneRoomToUsersInRoom(adminDto.roomId);
    }
    
    @SubscribeMessage('Admin-mute')
    async onMuteSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO)
    {
      if (await this.onAdminMethods(adminDto.roomId, socket.data.user.id, adminDto.targetUserId) === false)
      return ; //무시 케이스들

      //현재는 아예 데이터 베이스를 건들이지 않음.
      //mute에 걸리더라도 사용자가 나갔다가 들어오면 mute 풀릴 것.
      const now = new Date();
      const formattedTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;      
  
      const targetUserI = await this.userService.getOne(adminDto.targetUserId);
      const targetSocket = await this.connectedUserService.findByUser(targetUserI);
      this.server.to(targetSocket.socketId).emit('got-muted', formattedTime);
    }

    @SubscribeMessage('add-user-block')
    async onblockSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() targetId: number)
    {
      const newData = this.userService.addBlockList(socket.data.user.id, targetId);
      
      socket.emit("my-block-list", (await newData).block_list);
    }

    @SubscribeMessage('remove-user-block')
    async onUndoBlockSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() targetId: number)
    {
      const newData = this.userService.undoBlockList(socket.data.user.id, targetId);
      
      socket.emit("my-block-list", (await newData).block_list);
    }

  //--- 아직 구현 안한 쪽

  //소켓이 끊기는 순간 handledissconnection에서 room-leave와 connected-socket 데이터 정리를 잘 해야함!!! 꼭 테스트 할것

}
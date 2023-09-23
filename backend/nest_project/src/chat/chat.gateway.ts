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

//Injected Services
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { ConnectedUserService } from './services/connected-user/connected-user.service';
import { JoinedRoomService } from './services/joined-room/joined-room.service';
import { MessageService } from './services/message/message.service';
import { ProfileService } from '../user/profile/profile.service';

//DTOs
import { RoomCreateDTO, RoomJoinDTO, RoomInviteDTO, SimpleRoomDTO, RoomleaveDTO } from './dto/room.dto';
import { MessageDTO } from './dto/message.dto';
import { AdminRelatedDTO } from './dto/room.dto';

//Mappers
import { RoomMapper } from './mapper/room.mapper';
import { UserMapper } from './mapper/user.mapper';

import * as jwt from 'jsonwebtoken';
import { MessageMapper } from './mapper/message.mapper';

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
      private profileService : ProfileService,
      private connectedUserService: ConnectedUserService,
      private joinedRoomService: JoinedRoomService,
      private messageService: MessageService,
      private roomMapper: RoomMapper,
      private messageMapper: MessageMapper,
      private userMaaper: UserMapper,
        ) { };
  
  //required by OnModuleInit
  async onModuleInit() {
    await this.connectedUserService.deleteAll();
  };

  //-------소켓 연결 관련 메서드----------------------
  //required by OnGatewayConnection
  async handleConnection(socket: Socket) {
    try {
      // //인증 관련 부분(토큰 및 user 정보 socket에 주입 )
        const token = socket.handshake.headers.authorization;
        //userId가 없는 경우 or userProfile이나 userEntity가 없는 경우 소켓 연결끊음
        const userId = jwt.decode(token.split('Bearer ')[1])['userId'];
        if (!userId)
          return this.disconnect(socket);
        const userProfile = await this.profileService.getUserProfileById(userId);
        if (!userProfile)
          return this.disconnect(socket);
        const userForChat: UserI = await this.userService.getOne(userId);
        if (!userForChat)
          return this.disconnect(socket);
        const connection = await this.connectedUserService.findByUser(userForChat)
          this.logger.log(`connection : ${connection}`)  
        if (connection !== null)
            return this.disconnect(socket); //한 아이디로 채팅에 중복 입장 허용하지 않음
       
        //위에서 disconnect 하는 경우 (this.disconnect에 구현하면 됨)
        //"http://localhost:3001/signup"이나 메인으로 redirection 하는것도 좋을 것

        
        this.logger.log(`Try connection: ${socket.id}`); 

        socket.data.userId = userForChat.id;

        // Save connection to DB
        await this.connectedUserService.createfast(socket.id, userForChat, null);
        // this.logger.log(`saved to DB : ${socket.id}, ${userForChat}`); 
        
        await this.profileService.inchat(userId);
        
        this.logger.log(`before get rooms : ${userForChat.id}`); 

        //새로 만들어진 socket Id를 참여중인 room 들이 알 수 있도록 생성
        const rooms = (await this.userService.getUserWithrooms(userForChat.id)).rooms;
        this.logger.log(`rooms : ${rooms}`);
        if (rooms !== undefined && rooms.length > 0)
        {
          this.logger.log(`rooms : ${rooms.length}`);
          for (const room of rooms)
            await this.connectedUserService.createfastWithRoomId(socket.id, userForChat, room.roomId);
        }

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
    await this.profileService.logOn(socket.data.userId);
    // await this.profileService.inchat(socket.data.userId);
    socket.disconnect();
  }

    private disconnect(socket: Socket) 
    {
      //리다이렉션 하라는 메세지 여기에 넣자!
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
  //------------------------------------------------------
  //--------채팅 메서드 시작-------------------------

  //For Room(단체 채팅방 만들기용 메서드)
  @SubscribeMessage('Room-create')
  async chatRoomCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() room:RoomCreateDTO)
        // room:RoomCreateDTO) 
  {
    // socket.emit("respose!!!");
    // socket.broadcast.emit("respose!!!");
    this.logger.log(`userid : ${socket.data.userId}`)
    const userEntity = await this.userService.getOne(socket.data.userId);

    this.logger.log(`userEntity : ${userEntity}`);
   
    //방을 만들고 만든 사용자를 Owner로서 임명 
    const createdRoom = await this.roomService.createRoom(room, userEntity);
    
    if(!createdRoom)
    { //방만들기 실패
      this.emitErrorEvent(socket.id, "Response-Room-create", "the room is not exist now.")
      return ;
    }

    // const theroom  = await this.roomService.getRoomEntityWithBoth(createdRoom.roomId);
    // 유저를 방에 추가 시킴 
      this.roomService.addUserToRoom(socket.data.userId, createdRoom.roomId, socket.id);
    // this.logger.log(`theroom : ${theroom}`);
    // this.logger.log(`theroom : ${theroom.roomName}`);
    // return ; 
    // const user = await this.userService.getOne(socket.data.userId);
    // this.roomService.addUserToRoom(socket.data.userId, socket.id, theroom);
    // return ;

    // 방을 만든 사용자에게 현재 방의 정보 제공 
    await this.server.to(socket.id).emit('new_join_room',
       await this.roomMapper.Create_specificInterfaceToDto(createdRoom));
       // const currentRoomId = createdRoom.roomId;
       // await this.server.to(socket.id).emit(`messages_${currentRoomId}`, createdRoom);
       
    const newRoom = await this.roomService.getRoomEntityWithConnections(createdRoom.roomId);
    this.emitResponseEvent(socket.id, "Response-Room-create");
    this.emitNotice(newRoom, `[${newRoom.roomName}]방이 만들어졌습니다.`);
    
    const currentConnections = await this.connectedUserService.getByRoomId(null);
    this.logger.log(`cC : ${currentConnections}`);
    this.logger.log(`cC : ${(currentConnections).length}`);
    //  현 서버에 소켓 연결된 모든 채팅 사용자에게 room 정보를 보냄
    for (const connection of newRoom.connections)
    {
        this.logger.log(`dddd`);
        const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
        this.logger.log(`connection_socketId : ${connection.socketId}`);
        this.server.to(connection.socketId).emit('rooms', rooms);
      }
  }
  
  //For DM(개인 채팅용 방 만들기 메서드)
  @SubscribeMessage('DM-create')
  async chatDMCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: { room:RoomCreateDTO, userNickname: string })
        // room:RoomCreateDTO) 
  {
    const room = data.room;
    const userNickname = data.userNickname;
    if (room.roomType != 'dm')
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "not dm type");
      return ; //dm룸 만드는 명령이 아닌 경우 무시
    }
    const userTheOtherProfile = await this.profileService.getUserProfileByNickname(userNickname);
    if(!userTheOtherProfile)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "matching user not found");
      return ; //valid하지 않은 사용자 nickname을 넘긴경우 무시
    }
     const userTheOther = await this.userService.getOne(userTheOtherProfile.id);
    if ( userTheOther === undefined)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "matching user not found");
      return ; //valid하지 않은 사용자 nickname을 넘긴경우 무시
    }
    //내가 블락한 상대일 경우 실패
    const currentBlockList = await (await this.profileService.getUserProfileById(socket.data.userId)).block_list;
    if (currentBlockList.find(finding => userTheOther.id))
    {
      this.emitErrorEvent(socket.id, "Response-DM-create", "you've blocked that user");
      return ;
    }
    //내가 블락된 상대일 경우 실패
    if (userTheOtherProfile.block_list.find(finding => socket.data.userId))
    {
      this.emitErrorEvent(socket.id, "Response-DM-create", "you've been blocked by that user");
      return ;
    }

    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    if (!createdRoom)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "failed to creat it. Please retry");
      return ;
    }
    
    this.roomService.addUserToRoom(socket.data.userId, createdRoom.roomId, socket.id);
    //초대할 상대방 소켓 정보 가져오기
    const socketTheOther = await this.connectedUserService.findByUser(userTheOther);
    if (socketTheOther === undefined)
    {
      this.deleteRoom(createdRoom.roomId); //만든 방 삭제
      this.connectedUserService.removeByUserIdAndRoomId(socket.data.userId, createdRoom.roomId);
      this.emitErrorEvent(socket.id,"Response-DM-create", "the user is not connected to Chat");
      return ;//상대방이 연결된 상태가 아닐때 dm 못 만듬.
    }

    //상대방 사용자를 초대
    this.roomService.addUserToRoom(userTheOther.id, createdRoom.roomId, socketTheOther.socketId);
    
    //상대방과 나에게 현재 만들어진 room 정보를 포함해 전체 Joinedroom 보냄
    this.emitOneRoomToUsersInRoom(createdRoom.roomId);
    this.emitAllRoomsToUsersInRoom(createdRoom.roomId);
  }

  @SubscribeMessage('Room-invite')
  async onInviteRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomInvite: RoomInviteDTO) 
  {
    const targetProfile = await this.profileService.getUserProfileByNickname(roomInvite.targetUserNickname);
    const targetUserId = targetProfile.id;
    const userEntity = await this.userService.getOne(socket.data.userId);
    const userProfile = await this.profileService.getUserProfileById(socket.data.userId);
    //내가 차단한 유저 초대시 무시
    if (userProfile.block_list.find(finding => finding === targetUserId))
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you've blocked target user");
      return ;
    }
    // 나를 차단한 유저에게 초대 안 보냄(무시)
    if (targetProfile.block_list.find(finding => finding === userEntity.id))
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you've been blocked");
      return ;
    }
    
    // 현재 접속한 유저가 아닐 경우 초대 안 보냄
    const targetEntity = await this.userService.getOne(targetProfile.id);
    const connection = targetEntity.connections;
    if (connection === undefined)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "the target user is not connected to Chat right now");
      return ; 
    }
    
    // 타겟에게 초대 팝업 띄우기용 이벤트
    this.emitResponseEvent(socket.id,  "Responsse-Room-invite");
    this.server.to(targetEntity.connections[0].socketId).emit("invite-to-chat", roomInvite.roomId);
  }


  @SubscribeMessage('Room-join')
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: RoomJoinDTO) 
  {
    // this.server.to(socket.id).emit("hihi");
    if ( !(this.roomService.isRoomExist(room.roomId)))
      {
        this.emitErrorEvent(socket.id, "Response-Room-join", "the room is not exist now.")
        return ; //방이 존재하지 않음
      }
    if ( await this.roomService.isBannedUser(socket.data.userId, room.roomId))
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "this user is banned from the room.")
      return ; //ban 처리된 유저
    }
    const roomFromDB = await this.roomService.getRoomEntityWithUsers(room.roomId);
    // if(roomFromDB
      if (!( await this.roomService.isValidForJoin( roomFromDB, room)))
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "not valid password")
      return ; //참여할 자격이 안됨.
    }

    //새 참여자 추가하기
      this.roomService.addUserToRoom(socket.data.userId, roomFromDB.roomId, socket.id);

    //이전대화 불러와서 새로 들어온 사용자에게 보내주기.
    const currentRoomId = (await roomFromDB).roomId;
    const messages = await this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(roomFromDB), currentRoomId);

    const newUserProfile = await this.profileService.getUserProfileById(socket.data.userId);
    this.emitNotice(await roomFromDB, `[${newUserProfile.nickname}]님이 방에 새로 들어왔습니다!`);
    
    //이벤트명 동적생성
        // this.logger.log(`messages_${currentRoomId}`);
      // Send last messages from Room to User
    this.emitResponseEvent(socket.id, "Response-Room-join");
    this.server.to(socket.id).emit(`messages_${currentRoomId}`, messages);
    
    //내가 현재 참여하고 있는 방들 목록 emit하기
    const newUserEntity = await this.userService.getOne(socket.data.userId);
    this.emitUserJoingingRooms(socket.id, newUserEntity);

    }

  @SubscribeMessage('Room-enter')
  async onEnterRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: number) 
  {
    if ( await (this.roomService.isRoomExist(roomId)) === false)
      {
        //존재하지 않는 roomId 요청일 경우 무시
        this.emitErrorEvent(socket.id, "Response-Room-enter", "the room is not exist now.");
        return ;
      }
    if ( await this.roomService.isBannedUser(socket.data.userId, roomId))
    {
      this.emitErrorEvent(socket.id, "Response-Room-enter", "you are banned by that room.");
      return ; //ban 처리된 유저이면 요청 무시
    }
    const roomFromDB = this.roomService.getRoom(roomId);
   
    const currentRoomId = (await roomFromDB).roomId;
    //DB에서 messages 불러와서 사용자에게 보내주기.
    const messages = 
      this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(await roomFromDB), currentRoomId);

    // await this.server.to(socket.id).emit('messages', messages);

    //이벤트명 동적생성
    // Send last messages from Room to User
    await this.server.to(socket.id).emit(`messages_${currentRoomId}`, messages);
    
    this.emitOneRoomToOneUser(roomId, socket.id,"Response-Room-enter");
    this.emitUserJoingingRooms(socket.id, await this.userService.getOne(socket.data.userId));
  }

  private async deleteRoom(roomId:number)
  {
    await this.messageService.deleteByRoomId(roomId);
    await this.roomService.deleteRoomById(roomId);
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
  async onLeaveRoom( @ConnectedSocket() socket: Socket, @MessageBody() rooml : RoomleaveDTO) {

    const roomId = rooml.roomId;
    const roomToleave = await this.roomService.getRoomEntityWithBoth(roomId);
    if (!roomToleave)
    {
      this.emitErrorEvent(socket.id,"Response-Room-leave", "the room is not exist now.")
      return ;
    }
    const userId = socket.data.userId;
    this.logger.log(`userId : ${userId}`);
    const userProfile = await this.profileService.getUserProfileById(userId);
    this.logger.log(`userProfile : ${userProfile}`);
    if (!userProfile)
    {
      this.emitErrorEvent(socket.id,"Response-Room-leave", "not found user");
      return ;
    }
    const userNickname = userProfile.nickname;

    const userChat = await this.userService.getOne(userId);
    this.roomService.removeUserFromRoom(userChat, socket.id, roomId);
    // roomToleave.users = roomToleave.users.filter(user => user.id !== userId);
    // await this.connectedUserService.removeByUserIdAndRoomId(userId, roomId);
    
    //주인장일 경우 계승하고 나감
    const AfterRoom = await this.roomService.getRoomEntityWithBoth(roomId);
    if (AfterRoom.users === undefined || AfterRoom.users.length === 0)
      this.deleteRoom(roomId);
    else
    {
      if (userId === roomToleave.roomOwner)
        this.changeOwner(AfterRoom);
    }

    this.emitResponseEventWithNumber(socket.id, "Response-Room-leave", roomId);
    this.emitNotice(roomToleave, `[${userNickname}]님이 방을 나갔습니다!`);
    this.emitUserJoingingRooms(socket.id, await (this.userService.getOne(userId)));
    //dm에서는 room-leave를 부르지 않는다.
  }
  
  @SubscribeMessage('Message-add')
  async onAddMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messageDTO: MessageDTO) 
  {
    const room: RoomI  = await this.roomService.getRoomEntityWithConnections(
      messageDTO.roomId);
    if ( room === undefined)
    {
      //존재하지 않는 roomId 요청일 경우 무시
      this.emitErrorEvent(socket.id, "Response-Message-add", "the room is not exist now.")
      return ;
    }
    const createdMessage: MessageI 
      = await this.messageService.create(messageDTO, socket.data.userId);

    const connetedUsers = room.connections;
    if (connetedUsers === undefined)
    {
      //현재 실시간으로 받을 유저들이 없을 뿐, 데이터 베이스에 해당 메세지는 저장 되었다.
      this.emitResponseEvent(socket.id, "Response-Message-add");
      return ;
    }

    // 현재 방에 소켓 연결된 사람들에게 메세지 전달
    const currentRoomId = room.roomId;
    for(const user of connetedUsers) 
    {
      this.emitResponseEvent(socket.id, "Response-Message-add");
      const temp = await this.messageMapper.Create_entityToSimpleDto(createdMessage, currentRoomId);
      // this.logger.log(`temp : ${temp.text}`);
      this.server.to(user.socketId).emit(
        `messageAdded_${currentRoomId}`,
         await this.messageMapper.Create_entityToSimpleDto(createdMessage, currentRoomId));
    }
  }
  
  
  private async emitErrorEvent(socketId:string, errorName:string, reason: string)
  {
    await this.server.to(socketId).emit(errorName, {success : false, message : reason});
  }
  
  private async emitResponseEvent(socketId:string, eventName:string)
  {
    await this.server.to(socketId).emit(eventName, {success : true, message : undefined });
  }

  private async emitResponseEventWithNumber(socketId:string, eventName:string, roomId : number)
  {
    await this.server.to(socketId).emit(eventName, {success : true, message : undefined, roomId });
  }

  //----공지 기능 메서드-------------

  private async emitNotice(room:RoomI, message: string)
  {
    const newNotice : MessageDTO =
    {
      roomId : room.roomId,
      userId : undefined,
      text : message,
    }

    const createdMessage: MessageI 
      = await this.messageService.create(newNotice, undefined);

    // Send new Message to all joined Users of the room (currently online)
    const currentRoomId = room.roomId;
    
    const connectedUsers = room.connections

    if (connectedUsers === undefined)
      return ;
    for(const user of connectedUsers) 
    {
      // this.emitResponseEvent(user.socketId, "Response-Message-add");
      await this.server.to(user.socketId).emit(
        `messageAdded_${currentRoomId}`,
         await this.messageMapper.Create_entityToSimpleDto(createdMessage, currentRoomId));
    }
  }


  //-------방 정보 보내주기------------
  private async emitRoomsToAllConnectedUser()
  {
    //현 서버에 소켓 연결된 모든 유저들에게 현재 만들어져 있는 방 보여주기.
    const connectedUsers : ConnectedUserI[] = await this.connectedUserService.getByRoomId(null);
    for (const connetedUser of connectedUsers) 
    {
      const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
      // const rooms = await this.roomService.getRoomsForUser(user.id);
        await this.server.to(connetedUser.socketId).emit('rooms', rooms);
    }
  } 

  private async emitOneRoomToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    const connectedUsers = room.connections;
    // const joinedUsers: JoinedRoomI[] 
    //   =  await this.joinedRoomService.findByRoom(room);
    
    const currentRoomId = room.roomId; 
    for (const user of connectedUsers) 
      await this.server.to(user.socketId).emit(`current-room_${currentRoomId}`, room);
  }

  // private async emitUserArrayToUsersInRoom(roomId : number)
  // {
  //   const room: RoomI 
  //     = await this.roomService.getRoom(roomId);
  //   if (!room)
  //     return;
  //   const connectedUsers = room.connections;
  //   // const joinedUsers: JoinedRoomI[] 
  //   //   =  await this.joinedRoomService.findByRoom(room);
    
  //   const currentRoomId = room.roomId; 
  //   for (const user of connectedUsers) 
  //     await this.server.to(user.socketId).emit(`current-room_${currentRoomId}`, room);
  // }

  private async emitOneRoomToOneUser(roomId : number, socketId: string, responseEvent: string)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    this.emitResponseEvent(socketId, responseEvent);
    await this.server.to(socketId).emit('current-room_${roomId}', room);
  }

  //현재방(roomId)에 속한 모든 유저들에게, 각 유저가 속한 모든 방 목록 보내기
  private async emitAllRoomsToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;
    // const joinedUsers: JoinedRoomI[] 
      // =  await this.joinedRoomService.findByRoom(room);
    const conncetedUsers  = room.connections;
      for (const connection of conncetedUsers) 
    {
      const joiningrooms = await this.roomService.getRoomsForUser(connection.user.id);
      this.emitResponseEvent(connection.socketId, "Response-DM-create");
      this.logger.log(`joining : ${joiningrooms}`);
      this.logger.log(`joining : ${joiningrooms.length}`);
      await this.server.to(connection.socketId).emit(
        'me-joining-rooms', joiningrooms);
    }
  }

  private async emitUserJoingingRooms(socketId : string, user : UserI)
  {
      const joiningrooms = (await this.userService.getUserWithrooms(user.id)).rooms;
      // const joiningrooms = user.rooms;
      this.server.to(socketId).emit( 'me-joining-rooms', 
        await this.roomMapper.Create_simpleDTOArrays(joiningrooms));
  }
  // }
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
  
  //새 admin이 중간에 나가버린 경우 에러 처리
  @SubscribeMessage('Admin-add')
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO)
  {
    const amIAdmin = await this.roomService.isRoomAdmin(socket.data.user.userId, adminDto.roomId)
    if (amIAdmin === false)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-add", "you're not allowed to do that");
      return;
    }
    const currentRoom =  await this.roomService.getRoom(adminDto.roomId);
    if (!currentRoom)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-add", "the room is not exist any more");
      return ;
    }
    this.roomService.addAdmintoRoom(adminDto.roomId, adminDto.targetUserId);
    this.emitOneRoomToUsersInRoom(adminDto.roomId);
    
    const newAdmin = await this.profileService.getUserProfileById(adminDto.targetUserId);
    this.emitNotice( currentRoom, `[${newAdmin.nickname}]님이 새로운 admin이 되었습니다!`);
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
    if (await this.onAdminMethods(adminDto.roomId, socket.data.userId, adminDto.targetUserId) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-kick", "you are not allowed to do that");
      return ;//무시 케이스들
    }  
      //퇴장처리(onLeaveRoom과 겹치는 부분 리팩토링시 함수로 빼기)
      const roomToleave = await this.roomService.getRoom(adminDto.roomId);
      if (!roomToleave)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-kick", "this room is not existed now");
        return ;
      }
      const userId = adminDto.targetUserId;
      // this.joinedRoomService.deleteBySocketId(socket.id);
      roomToleave.connections = roomToleave.connections.filter(toReduce => toReduce.id === userId);
      roomToleave.users = roomToleave.users.filter(toReduce => toReduce.id ===  userId);
      //admin-kick은 본인을 퇴장 시키는 경우는 없기에, 항상 1명 이상의 사용자가 방에 남아있게 된다.

      //현재 방 유저에게 현재 방 정보 제공
      this.emitResponseEvent(socket.id, "Response-Admin-kick");
      this.emitOneRoomToUsersInRoom(adminDto.roomId);
      this.emitNotice(roomToleave, `${userId}님이 kick 당했습니다.`);
    }

    @SubscribeMessage('Admin-Ban')
    async onBanSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO
    )
    {
      if (await this.onAdminMethods(adminDto.roomId, socket.data.userId, adminDto.targetUserId) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "You're not allowed to do that");
        return ;
      }
      
      // target을 현재 방의 banlist에 추가
      const updatedRoom = await this.roomService.addUserToBanList(adminDto);

       //퇴장처리(onLeaveRoom과 겹치는 부분 리팩토링시 함수로 빼기)
       const roomToleave = await this.roomService.getRoom(adminDto.roomId);
       if (!roomToleave)
       {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "the room is not exist any more");
        return ;
       }
       const userId = adminDto.targetUserId;
      //  this.joinedRoomService.deleteBySocketId(socket.id);
       roomToleave.connections = roomToleave.connections.filter(toReduce => toReduce.id ===  userId);
       roomToleave.users = roomToleave.users.filter(toReduce => toReduce.id ===  userId);

       //현재 방 유저에게 현재 방 정보 제공
      this.emitResponseEvent(socket.id, "Response-Admin-Ban");
      this.emitOneRoomToUsersInRoom(adminDto.roomId);
      this.emitNotice(roomToleave, `${userId}님이 Ban 당했습니다.`);
    }
    
    @SubscribeMessage('Admin-mute')
    async onMuteSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO)
    {
      if (await this.onAdminMethods(adminDto.roomId, socket.data.userId, adminDto.targetUserId) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "You're not allowed to do that");
        return ;
      }

      //mute에 걸리더라도 사용자가 나갔다가 들어오면 mute 풀릴 것.
      const now = new Date();
      
      const targetUserI = await this.userService.getOne(adminDto.targetUserId);
      if(!targetUserI)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "not existed user");
        return ;
      }
      const targetSocket = await this.connectedUserService.findByUser(targetUserI);
      if(!targetSocket)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "not connceted user");
        return ;
      }
      const targetProfile = await this.profileService.getUserProfileById(targetUserI.id);
      if(!targetProfile)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "not exist user");
        return ;
      }
      const room = await this.roomService.getRoom(adminDto.roomId);
      if(!room)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "this room is not exist");
        return ;
      }
      this.server.to(targetSocket.socketId).emit('got-muted', now);
      this.emitNotice(room, `${targetProfile.nickname}님이 3분간 mute 당했습니다.`);
    }

    // @SubscribeMessage('add-user-block')
    // async onblockSomeone(
    //   @ConnectedSocket() socket: Socket,
    //   @MessageBody() targetId: number)
    // {
    //   const newData = this.userService.addBlockList(socket.data.userId, targetId);
      
    //   socket.emit("my-block-list", (await newData).block_list);
    // }

    // @SubscribeMessage('remove-user-block')
    // async onUndoBlockSomeone(
    //   @ConnectedSocket() socket: Socket,
    //   @MessageBody() targetId: number)
    // {
    //   const newData = this.userService.undoBlockList(socket.data.userId, targetId);
      
    //   socket.emit("my-block-list", (await newData).block_list);
    // }

    @SubscribeMessage('get-user-profile')
    async onGetUserProfile(
      @ConnectedSocket() socket: Socket,
      @MessageBody() targetId: number
    )
    {
      const profile_info = await this.profileService.getUserProfileById(targetId);
      await socket.emit( "user-profile-info",
           (await this.userMaaper.Create_simpleProfileEntityToDto(profile_info)));
    }

    @SubscribeMessage('get-users')
    async onGetUsersIntheRoom(
      @ConnectedSocket() socket: Socket,
      @MessageBody() roomId: number
    )
    {
      const roomWithBoth = await this.roomService.getRoomEntityWithBoth(roomId);
      if (roomWithBoth === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-get-users", "the room is not found");
        return ;
      }
      const users = roomWithBoth.users;
      if (users === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-get-users", "no one is not found in the room");
        return ;
      }
      const simpleUsers = await this.userMaaper.Create_simpleDTOArrays(users);
      const connectedUsers = roomWithBoth.connections;
      if (connectedUsers === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-get-users", "no one to emit");
        return ;
      }
      
      for (const user of connectedUsers) 
      {
        await this.server.to(user.socketId).emit(`current-users_${roomId}`, simpleUsers);     
        this.emitResponseEvent(socket.id, "Response-get-users");
      }
    }

}
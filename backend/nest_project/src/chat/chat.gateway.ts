//Modules
import { Logger } from '@nestjs/common';
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

//Entities

//Interfaces
import { RoomI } from './interfaces/room.interface';
import { UserI } from './interfaces/user.interface';
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
import { InvitationService } from 'src/game/service/invitation.service';
import { ConnectedFriendlyPlayerService } from 'src/game/service/connectedFriendlyPlayer.service';
import { SimpleUserDto } from './dto/simpleUser.dto';

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
      private invitationService : InvitationService,
      private connectedFriendlyPlayerService : ConnectedFriendlyPlayerService,
        ) { };
  
  //required by OnModuleInit

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    // this.roomService.createBasicRoom();
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
        if (connection !== null)
        {
          this.connectedUserService.deleteAllbyUserId(userId);
          // const this.connectedUserService.findByUser()
        }  
            // this.disconnect(socket); //한 아이디로 채팅에 중복 입장 허용하지 않음
       
        //위에서 disconnect 하는 경우 (this.disconnect에 구현하면 됨)
        //"http://localhost:3001/signup"이나 메인으로 redirection 하는것도 좋을 것

        socket.data.userId = userForChat.id;

        // Save connection to DB
        await this.connectedUserService.createfast(socket.id, userForChat, null);
        
        await this.profileService.inchat(userId);
        

        //새로 만들어진 socket Id를 참여중인 room 들이 알 수 있도록 생성
        const rooms = (await this.userService.getUserWithrooms(userForChat.id)).rooms;
        if (rooms !== undefined && rooms.length > 0)
        {
          for (const room of rooms)
            await this.connectedUserService.createfastWithRoomId(socket.id, userForChat, room.roomId);
          }

        const openRooms = await this.roomService.getRoomsByType(['open']);
        socket.emit('rooms', openRooms);
        socket.emit('me-joining-rooms', await this.roomMapper.Create_simpleDTOArrays(rooms));
        socket.emit("my-block-list", ((await this.profileService.getUserProfileById(userId)).block_list));
        return ;
      } catch {
       this.logger.log(`error occur`); 
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) 
  {
    // // remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    await this.profileService.logOn(socket.data.userId);
   await socket.disconnect();
  }

  private async disconnect(socket: Socket) 
  {
    //리다이렉션 하라는 메세지 여기에 넣자!
    await this.profileService.logOn(socket.data.userId);

    await socket.disconnect();
  };

  // @SubscribeMessage("socketId & message")
	// ServerLog(
	// 	@ConnectedSocket() socket: Socket,
	// 	@MessageBody() message: string 
  //   )
  // {
	// }
  //------------------------------------------------------
  //--------채팅 메서드 시작-------------------------

  private async amIValidUser(socketId : string) : Promise<boolean>
  {
    const connections = await this.connectedUserService.getBySocketId(socketId);
    if (connections === null || connections === undefined)
      return false;
    return true;
  } 

  private async amIInTheRoom(userId : number, roomId :number) : Promise<boolean>
  {
    const rooms = await this.roomService.getRoomsForUser(userId);
    if (rooms === null || rooms === undefined)
      return false;
    if (rooms.find(finding => finding.roomId === roomId) === undefined ||
      rooms.find(finding => finding.roomId === roomId) === null )
      return false;
    return true;
  }

  //For Room(단체 채팅방 만들기용 메서드)
  @SubscribeMessage('Room-create')
  async chatRoomCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() room:RoomCreateDTO)
        // room:RoomCreateDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Room-create", "you are not valid user.")
      return ;
    }
    const userEntity = await this.userService.getOne(socket.data.userId);

    //방을 만들고 만든 사용자를 Owner로서 임명 
    const createdRoom = await this.roomService.createRoom(room, userEntity);
    
    if (!createdRoom)
    { //방만들기 실패
      this.emitErrorEvent(socket.id, "Response-Room-create", "the room is not exist now.")
      return ;
    }

    // 유저를 방에 추가 시킴 
    if (await this.roomService.addUserToRoom(socket.data.userId, createdRoom.roomId, socket.id) === null)
    {
      this.emitErrorEvent(socket.id, "Response-Room-create", "failed to join the room");
      return ;
    }
    const createdRoomWithUsers = await this.roomService.getRoomEntityWithUsers(createdRoom.roomId);
    this.emitResponseEvent(socket.id, "Response-Room-create");
    // 방을 만든 사용자에게 현재 방의 정보 제공 
    await this.server.to(socket.id).emit(`current-room_${createdRoom.roomId}`,
       await this.roomMapper.Create_specificInterfaceToDto(createdRoomWithUsers));
       
    const newRoom = await this.roomService.getRoomEntityWithConnections(createdRoom.roomId);
    this.emitNotice(newRoom, `[${newRoom.roomName}]방이 만들어졌습니다.`);
    const userProfile = await this.profileService.getUserProfileById(socket.data.userId);
    this.emitNotice(newRoom, `[${userProfile.nickname}]님이 방에 새로 들어왔습니다!`);
    
    this.emitUserJoingingRooms(socket.id, userEntity);
    // const currentConnections = await this.connectedUserService.getByRoomId(null);
    const currentConnections = await this.connectedUserService.getAllConnectedSocketIds();
    //  현 서버에 소켓 연결된 모든 채팅 사용자에게 room 정보를 보냄
    for (const connection of currentConnections)
    {
        const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
        this.server.to(connection).emit('rooms', rooms);
    }
  }
  
  //For DM(개인 채팅용 방 만들기 메서드)
  @SubscribeMessage('DM-create')
  async chatDMCreate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: { room:RoomCreateDTO, userNickname: string })
        // room:RoomCreateDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-DM-create", "you are not valid user.")
      return ;
    }
    const room = data.room;
    const userNickname = data.userNickname;
    if (room.roomType != 'dm')
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "not dm type");
      return ; //dm룸 만드는 명령이 아닌 경우
    }
    const userTheOtherProfile = await this.profileService.getUserProfileByNickname(userNickname);
    if(!userTheOtherProfile)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "matching user not found");
      return ; //valid하지 않은 사용자 nickname을 넘긴경우
    }
    if ( socket.data.userId === userTheOtherProfile.id) //자신과의 대화 불가
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "you are not allowed to do that");
      return ;
    }
     const userTheOther = await this.userService.getOne(userTheOtherProfile.id);
    if ( userTheOther === undefined)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "matching user not found");
      return ; //valid하지 않은 사용자 nickname을 넘긴경우
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
    const myUserEntity = await this.userService.getOne(socket.data.userId);
    const createdRoom: RoomI = await this.roomService.createRoom(room, myUserEntity);
    if (!createdRoom)
    {
      this.emitErrorEvent(socket.id,"Response-DM-create", "failed to creat it. Please retry");
      return ;
    }
    
    if ((await this.roomService.addUserToRoom(socket.data.userId, createdRoom.roomId, socket.id)) === null)
    {
      this.emitErrorEvent(socket.id, "Response-DM-create", "failed to join the DM");
      return ;
    }

    //초대할 상대방 소켓 정보 가져오기
    const socketTheOther = await this.connectedUserService.findByUser(userTheOther);
    if (socketTheOther === undefined || socketTheOther === null)
    {
      await this.deleteRoom(createdRoom.roomId); //만든 방 삭제
      this.connectedUserService.removeByUserIdAndRoomId(socket.data.userId, createdRoom.roomId);
      this.emitErrorEvent(socket.id,"Response-DM-create", "the user is not connected to Chat");
      return ;//상대방이 연결된 상태가 아닐때 dm 못 만듬.
    }

    //상대방 사용자를 초대
    if ((await this.roomService.addUserToRoom(userTheOther.id, createdRoom.roomId, socketTheOther.socketId)) === null)
    {
      this.deleteRoom(createdRoom.roomId); //만든 방 삭제
      this.connectedUserService.removeByUserIdAndRoomId(socket.data.userId, createdRoom.roomId);
      this.emitErrorEvent(socket.id, "Response-DM-create", "failed to invite them");
      return ;
    }
    
    const createdRoomWithUsers = await this.roomService.getRoomEntityWithUsers(createdRoom.roomId);

    this.emitResponseEvent(socket.id,"Response-DM-create");
    this.emitNotice(createdRoom, "새로운 dm 대화가 시작되었습니다!");
    //상대방과 나에게 현재 만들어진 room 정보를 포함해 전체 Joinedroom 보냄
    this.emitOneRoomToUsersInRoom(createdRoom.roomId);
    this.emitAllRoomsToUsersInRoom(createdRoom.roomId);
  }

  @SubscribeMessage('Room-invite')
  async onInviteRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomInvite: RoomInviteDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, roomInvite.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you are not valid user.")
      return ;
    }
    
    const targetProfile = await this.profileService.getUserProfileByNickname(roomInvite.targetUserNickname);
    if(targetProfile === null || targetProfile === undefined)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "user is not found");
      return ;
    }
    const targetUserId = targetProfile.id;
    const userEntity = await this.userService.getOne(socket.data.userId);
    if(userEntity === undefined || userEntity === null)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "something's going wrong. please try again");
      return ;
    }
    const userProfile = await this.profileService.getUserProfileById(socket.data.userId);

    //내가 차단한 유저 초대시
    if (userProfile.block_list.find(finding => finding === targetUserId) !== undefined )
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you've blocked target user");
      return ;
    }

    // 나를 차단한 유저에게 초대 안 보냄
    if (targetProfile.block_list.find(finding => finding === userEntity.id) !== undefined )
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "you've been blocked");
      return ;
    }
    
    // 현재 접속한 유저가 아닐 경우 초대 안 보냄
    const targetEntity = await this.userService.getOne(targetProfile.id);
    const connection = await this.connectedUserService.findOnebyUserId(targetEntity.id);
    if (connection === undefined)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "the target user is not connected to Chat right now");
      return ; 
    }
    
    const currentRoom = await this.roomService.getRoomEntityWithCUM(roomInvite.roomId);
    if (currentRoom === undefined)
    {
      this.emitErrorEvent(socket.id, "Responsse-Room-invite", "the room is not exist anymore");
      return ; 
    }
    
    const simpleroom = await this.roomMapper.Create_simpleInterfaceToDto(
         currentRoom);
    
    this.emitResponseEvent(socket.id,  "Responsse-Room-invite");

    //타겟 납치 & 타겟에게 알림
    await this.roomService.addUserToRoom(targetEntity.id, currentRoom.roomId, connection.socketId);
    const newUserProfile = await this.profileService.getUserProfileById(targetEntity.id);
    const currentRoomId = (currentRoom).roomId;
    
    //납치 대상한테 알림
    this.server.to(connection.socketId).emit("invite-to-chat", simpleroom);
    
    //그간 메세지 보내주기
    const messages = await this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(currentRoom), currentRoomId);
    this.server.to(connection.socketId).emit(`messages_${currentRoomId}`, messages);

    this.emitNotice(currentRoom, `[${newUserProfile.nickname}]님이 방에 새로 들어왔습니다!`);
      //다른 멤버들, 커넥션들에게 알림
    this.emitOneRoomToUsersInRoom(currentRoom.roomId);
    const newUserEntity = await this.userService.getOneUSerWithRoomsAndConnections(socket.data.userId);
    this.emitUserJoingingRooms(socket.id, newUserEntity);
    this.emitRoomsToAllConnectedUser();
    
  }


  @SubscribeMessage('Game-invite')
  async onInviteToGame(
      @ConnectedSocket() socket: Socket,
      @MessageBody() data: {targetId: number}) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "you are not valid user.")
      return ;
    }
   
    const targetId = data.targetId;
    const userEntity = await this.userService.getOne(socket.data.userId);
    if(userEntity === undefined || userEntity === null)
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "something's going wrong. please try again");
      return ;
    }
    const userProfile = await this.profileService.getUserProfileById(socket.data.userId);
    //내가 차단한 유저 초대시
    if (userProfile.block_list.find(finding => finding === targetId) !== undefined )
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "you've blocked target user");
      return ;
    }


    const targetProfile = await this.profileService.getUserProfileById(targetId);

    // 나를 차단한 유저에게 초대 안 보냄
    if (targetProfile.block_list.find(finding => finding === userEntity.id) !== undefined )
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "you've been blocked");
      return ;
    }
    
    // 현재 접속한 유저가 아닐 경우 초대 안 보냄
    const targetEntity = await this.userService.getOne(targetProfile.id);
    const targetConnection = await this.connectedUserService.findOnebyUserId(targetEntity.id);
    if (targetConnection === undefined)
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "the target user is not connected to Chat right now");
      return ; 
    }
    
    const invitationEntity = await this.invitationService.create(socket.data.userId, targetId);
    if(invitationEntity === undefined || invitationEntity === null)
    {
      this.emitErrorEvent(socket.id, "Response-Game-invite", "Please try again");
      return ; 
    }

    this.emitResponseEvent(socket.id,  "Response-Game-invite");
    const simpleUser : SimpleUserDto = {
      
      id: userProfile.id,
      
      nickname : userProfile.nickname,
    } 
    
    this.server.to(targetConnection.socketId).emit("got-invited-to-game", simpleUser);
    //   //다른 멤버들, 커넥션들에게 알림
    // this.emitOneRoomToUsersInRoom(currentRoom.roomId);
    // const newUserEntity = await this.userService.getOneUSerWithRoomsAndConnections(socket.data.userId);
    // this.emitUserJoingingRooms(socket.id, newUserEntity);
    // this.emitRoomsToAllConnectedUser();
    
  }

  @SubscribeMessage('Refuse-Game-invite')
  async onRefuseInvitationToGame(
      @ConnectedSocket() socket: Socket,
      @MessageBody() hostId: number) 
  {
    await this.connectedFriendlyPlayerService.refuseInvitation(socket.data.userId, hostId);
    this.emitResponseEvent(socket.id,  "Responsse-Refuse-Game-invite");
  }

  private async enterTheRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: number) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, roomId)  === false )
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are not valid user.")
      return ;
    }
    if ( await (this.roomService.isRoomExist(roomId)) === false)
      {
        //존재하지 않는 roomId 요청일 경우 무시
        this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "the room is not exist now.");
        return ;
      }
      const usersIntheRoom = (await this.roomService.getRoomEntityWithUsers(roomId)).users;
    // const connectionsInTheRoom  = await this.connectedUserService.getByRoomId(roomId);

    const isExistUser = usersIntheRoom.find(finding => finding.id === socket.data.userId);
    if (isExistUser === null || isExistUser === undefined)
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "You are not envolved here right now. Join first!");
      return ;
    }
    if ( await this.roomService.isBannedUser(socket.data.userId, roomId))
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are banned by that room.");
      return ; //ban 처리된 유저이면 요청 무시
    }
    const roomFromDB = await this.roomService.getRoomEntityWithMessages(roomId);
    const currentRoomId = (await roomFromDB).roomId;
    //DB에서 messages 불러와서 사용자에게 보내주기.
    const messages = await this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(roomFromDB), currentRoomId);
    socket.emit(`messages_${currentRoomId}`, messages);
    
    this.emitOneRoomToOneUser(roomId, socket.id,`Response-Room-enter_${roomId}`);
    this.emitUserJoingingRooms(socket.id, await this.userService.getOne(socket.data.userId));
  }

  @SubscribeMessage('Room-join')
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: RoomJoinDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "you are not valid user.")
      return ;
    }
    const roomFromDB = await this.roomService.getRoomEntityWithUsers(room.roomId);
    if ( roomFromDB === undefined || roomFromDB === null)
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "the room is not exist now.")
      return ; //방이 존재하지 않음
    }
    if ( await this.roomService.isBannedUser(socket.data.userId, room.roomId))
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "this user is banned from the room.")
      return ; //ban 처리된 유저
    }
    if (roomFromDB.users.find(finding => finding.id === socket.data.userId ) !== undefined)
    {
      this.emitResponseEvent(socket.id, "Response-Room-join");
      // await this.enterTheRoom(socket, room.roomId);
      return;
    }
    if (( await this.roomService.isValidForJoin( roomFromDB, room)) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Room-join", "not valid password")
      return ; //참여할 자격이 안됨.
    }
    //새 참여자 추가하기
      if(this.roomService.addUserToRoom(socket.data.userId, roomFromDB.roomId, socket.id) === null)
      {
        this.emitErrorEvent(socket.id, "Response-Room-join", "failed to join the room");
        return ;
      }
      
      this.emitResponseEvent(socket.id, "Response-Room-join");

    //이전대화 불러와서 새 사용자에게 보내주기.
    const currentRoomId = (await roomFromDB).roomId;
    const messages = await this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(roomFromDB), currentRoomId);
    socket.emit(`messages_${currentRoomId}`, messages);

    const newUserProfile = await this.profileService.getUserProfileById(socket.data.userId);
    this.emitNotice(await roomFromDB, `[${newUserProfile.nickname}]님이 방에 새로 들어왔습니다!`);
    
   
    this.emitOneRoomToUsersInRoom(currentRoomId);
    //내가 현재 참여하고 있는 방들 목록 emit하기
    const newUserEntity = await this.userService.getOneUSerWithRoomsAndConnections(socket.data.userId);
    this.emitUserJoingingRooms(socket.id, newUserEntity);
    this.emitRoomsToAllConnectedUser();
    }

  @SubscribeMessage('Room-enter')
  async onEnterRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: number) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, roomId)  === false )
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are not valid user.")
      return ;
    }
    if ( await (this.roomService.isRoomExist(roomId)) === false)
      {
        //존재하지 않는 roomId 요청일 경우 무시
        this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "the room is not exist now.");
        return ;
      }
      const usersIntheRoom = (await this.roomService.getRoomEntityWithUsers(roomId)).users;
    // const connectionsInTheRoom  = await this.connectedUserService.getByRoomId(roomId);

    const isExistUser = usersIntheRoom.find(finding => finding.id === socket.data.userId);
    if (isExistUser === null || isExistUser === undefined)
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "You are not envolved here right now. Join first!");
      return ;
    }
    if ( await this.roomService.isBannedUser(socket.data.userId, roomId))
    {
      this.emitErrorEvent(socket.id, `Response-Room-enter_${roomId}`, "you are banned by that room.");
      return ; //ban 처리된 유저이면 요청 무시
    }
    const roomFromDB = await this.roomService.getRoomEntityWithMessages(roomId);
    const currentRoomId = (await roomFromDB).roomId;
    //DB에서 messages 불러와서 사용자에게 보내주기.
    const messages = await this.messageMapper.Create_simpleDTOArrays(
        await this.messageService.findMessagesForRoom(roomFromDB), currentRoomId);
    socket.emit(`messages_${currentRoomId}`, messages);

    //이벤트명 동적생성
    // await this.server.to(socket.id).emit(`messages_${currentRoomId}`, await messages);
    
    this.emitOneRoomToOneUser(roomId, socket.id,`Response-Room-enter_${roomId}`);
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
    room.roomAdmins.push(room.roomOwner);
    await this.roomService.savechangedOwner(room);
  }

  @SubscribeMessage('Room-leave')
  async onLeaveRoom( 
    @ConnectedSocket() socket: Socket, 
    @MessageBody() rooml : RoomleaveDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Room-leave", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, rooml.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Response-Room-leave", "you are not valid user.")
      return ;
    }
    const roomId = rooml.roomId;
    const roomToleave = await this.roomService.getRoom(roomId);
    if (!roomToleave)
    {
      this.emitErrorEvent(socket.id,"Response-Room-leave", "the room is not exist now.")
      return ;
    }
    const userId = socket.data.userId;
    const userProfile = await this.profileService.getUserProfileById(userId);
    if (!userProfile)
    {
      this.emitErrorEvent(socket.id,"Response-Room-leave", "not found user");
      return ;
    }
    const userNickname = userProfile.nickname;

    const userChat = await this.userService.getOneUSerWithRoomsAndConnections(userId);

    //나갈 유저 제거
    await this.roomService.removeUserFromRoom(userChat, socket.id, roomToleave.roomId);
    // roomToleave.users = roomToleave.users.filter(user => user.id !== userId);
    // await this.connectedUserService.removeByUserIdAndRoomId(userId, roomId);
    
    this.emitResponseEventWithNumber(socket.id, "Response-Room-leave", rooml.roomId);
    this.emitJoiningRoomsToOneUser(socket.data.userId, socket.id);
    this.emitRoomsToOneUser(socket.id);

    //주인장일 경우 계승하고 나감 + 아무도 없으면 다 삭제
    const AfterRoom = await this.roomService.getRoomEntityWithCUM(roomId);
    if (AfterRoom.users === undefined || AfterRoom.users.length === 0)
    {
      await this.deleteRoom(roomId);
      await this.emitUserJoingingRooms(socket.id, await (this.userService.getOneUSerWithRoomsAndConnections(userId)));
      await this.emitRoomsToAllConnectedUser();
      return ;
    }
    else
    {
      if (userId === roomToleave.roomOwner)
        await this.changeOwner(AfterRoom);
    }
    this.emitResponseEventWithNumber(socket.id, "Response-Room-leave", roomId);
    this.emitNotice(roomToleave, `[${userNickname}]님이 방을 나갔습니다!`);
    this.emitOneRoomToUsersInRoom(roomToleave.roomId);
    this.emitRoomsToAllConnectedUser();
  }
  
  @SubscribeMessage('Message-add')
  async onAddMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messageDTO: MessageDTO) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Message-add", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, messageDTO.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Response-Message-add", "you are not valid user.")
      return ;
    }
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
    if (connetedUsers === undefined || connetedUsers === null)
    {
      //현재 실시간으로 받을 유저들이 없을 뿐, 데이터 베이스에 해당 메세지는 저장 되었다.
      this.emitResponseEvent(socket.id, "Response-Message-add");
      return ;
    }

    // 현재 방에 소켓 연결된 사람들에게 메세지 전달
    const currentRoomId = room.roomId;
    await this.messageMapper.Create_entityToSimpleDto(createdMessage, currentRoomId);
    for(const user of connetedUsers) 
    {
      this.emitResponseEvent(socket.id, "Response-Message-add");
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
    
    const connectedUsers = (await this.roomService.getRoomEntityWithConnections(room.roomId)).connections;

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
    // const connectedUsers : ConnectedUserI[] = await this.connectedUserService.getByRoomId(null);
    const connectedUsers = await this.connectedUserService.getAllConnectedSocketIds();
    // const currentConnections = await this.connectedUserService.getAllConnectedUsersWithNull();


    for (const connetedUser of connectedUsers) 
    {
      const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
      // const rooms = await this.roomService.getRoomsForUser(user.id);
        await this.server.to(connetedUser).emit('rooms', rooms);
    }
  } 

  private async emitRoomsToOneUser(socketId : string)
  {
      const rooms = await this.roomService.getRoomsByType(['open']); //roomType이 DM, private 이 아닌 애들만.
      await this.server.to(socketId).emit('rooms', rooms);
  } 

  private async emitOneRoomToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoomEntityWithConnections(roomId);
    if (!room)
      return;
    const connectedUsers = room.connections;
    if (connectedUsers === null || connectedUsers === undefined)
      return ;//현재 접속중인 유저가 없어서 당장 전송하진 않음.
    const roomWithUsers 
        = await this.roomService.getRoomEntityWithUsers(roomId); 
    const specificRoom = await this.roomMapper.Create_specificInterfaceToDto(roomWithUsers);
    const currentRoomId = room.roomId; 
    for (const user of connectedUsers) 
      await this.server.to(user.socketId).emit(`current-room_${currentRoomId}`, specificRoom);
  }

  private async emitOneRoomToOneUser(roomId : number, socketId: string, responseEvent: string)
  {
    const room: RoomI 
      = await this.roomService.getRoomEntityWithUsers(roomId);
    if (!room)
      return;
    const specificRoom = await this.roomMapper.Create_specificInterfaceToDto(room);
    this.emitResponseEvent(socketId, responseEvent);
    await this.server.to(socketId).emit(`current-room_${roomId}`, specificRoom);
  }

  //현재방(roomId)에 속한 모든 유저들에게, 각 유저가 속한 모든 방 목록 보내기
  private async emitAllRoomsToUsersInRoom(roomId : number)
  {
    const room: RoomI 
      = await this.roomService.getRoom(roomId);
    if (!room)
      return;

      const conncetedUsers  = await this.connectedUserService.getByRoomIdWithUser(roomId);
    if(conncetedUsers === null || conncetedUsers === undefined)
      return ; //현재 접속한 유저가 없어, 당장 전송하진 않음.
    for (const connection of conncetedUsers) 
    {
      // this.connectedUserService.
      const joiningrooms = await this.roomMapper.Create_simpleDTOArrays((await this.userService.getUserWithrooms(connection.user.id)).rooms);
      await this.server.to(connection.socketId).emit(
        'me-joining-rooms', joiningrooms);
    }
  }

  private async emitJoiningRoomsToOneUser(userId: number,socketId : string)
  {
      const joiningrooms = await this.roomMapper.Create_simpleDTOArrays((await this.userService.getUserWithrooms(userId)).rooms);
      await this.server.to(socketId).emit('me-joining-rooms', joiningrooms);
  }

  private async emitUserJoingingRooms(socketId : string, user : UserI)
  {
      const joiningrooms = (await this.userService.getUserWithrooms(user.id)).rooms;
      await this.server.to(socketId).emit( 'me-joining-rooms', 
        await this.roomMapper.Create_simpleDTOArrays(joiningrooms));
  }

  //----------------------------------

  @SubscribeMessage('Owner-Room-edit')
  async onEditRoomByOwner(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data : {editData: RoomCreateDTO, roomId: number }) 
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Owner-Room-edit", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, data.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Response-Owner-Room-edit", "you are not valid user.")
      return ;
    }
    const editData = data.editData;
    const roomId = data.roomId;
      if ( await this.roomService.isRoomOwner(socket.data.userId, roomId) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Owner-Room-edit","you're not the owner");
        return ; //주인장이 아닌 사람이 한 요청일때 무시
      }
      const editedRoom = await this.roomService.editRoom(roomId, editData);
      if (editedRoom === null)
      {
        this.emitErrorEvent(socket.id, "Response-Owner-Room-edit", "you can't edit dm rooms");
      }
      this.logger.log(`edited : ${editedRoom.roomPass}`);
      this.emitResponseEvent(socket.id, "Response-Owner-Room-edit");
      this.emitOneRoomToUsersInRoom(editedRoom.roomId);
      this.emitRoomsToAllConnectedUser();
  }
  
  @SubscribeMessage('Admin-add')
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO)
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-add", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, adminDto.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Response-Admin-add", "you are not valid user.")
      return ;
    }
    const amIAdmin = await this.roomService.isRoomAdmin(socket.data.userId, adminDto.roomId)
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
    if (await (this.roomService.addAdmintoRoom(adminDto.roomId, adminDto.targetUserId)) === null)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-add", "the user is not in the room");
      return ;
    } 
    
    this.emitResponseEvent(socket.id, "Response-Admin-add");
    this.emitOneRoomToUsersInRoom(adminDto.roomId);
    const newAdmin = await this.profileService.getUserProfileById(adminDto.targetUserId);
    this.emitNotice( currentRoom, `[${newAdmin.nickname}]님이 새로운 admin이 되었습니다!`);
  }

  private async onAdminMethods(roomId : number, meId : number, targetUserId : number) : Promise<boolean>
  {
    if ((await this.roomService.isRoomOwner(targetUserId, roomId)) === true)
      return false; //target이 주인장인 경우
    if (await this.roomService.isRoomAdmin(meId, roomId) === false)
      return false; //요청한 user가 admin이 아닌 경우
    if (meId === targetUserId)
      return false; //본인을 대상으로한 행동
  }

  @SubscribeMessage('Admin-kick')
  async onKickSomeone(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminDto: AdminRelatedDTO
  )
  {
    if (await this.amIValidUser(socket.id) === false)
    {
      this.emitErrorEvent(socket.id, "Response-Admin-kick", "you are not valid user.")
      return ;
    }
    if (await this.amIInTheRoom(socket.data.userId, adminDto.roomId)  === false )
    {
      this.emitErrorEvent(socket.id, "Response-Admin-kick", "you are not valid user.")
      return ;
    }
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
      const targetId = adminDto.targetUserId;
      const targetUserI = await this.userService.getOneUSerWithRoomsAndConnections(adminDto.targetUserId);
      if (targetUserI === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-kick", "not found user");
        return ;
      }
      if (roomToleave.users.find(finding => finding.id === targetId ) === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-kick", "the user is not in the room");
        return ;
      }
      this.roomService.removeUserFromRoom(targetUserI, socket.id, roomToleave.roomId);
   
      //쫓겨난 사람에게 새로 방정보 제공 --> 현재 접속한 경우에만.
      const targetSocket = await this.connectedUserService.findOnebyUserId(targetId);
      if(targetSocket === undefined || targetSocket === null)
      {
        await  this.emitErrorEvent(socket.id, "Response-Admin-kick", "the user not connected now");
      }
      else
      {
        this.server.to(targetSocket.socketId).emit(`got-kicked_${roomToleave.roomId}`);
  
        this.emitJoiningRoomsToOneUser(targetId, targetSocket.socketId);
        this.emitRoomsToOneUser(targetSocket.socketId);
      }

      const targetUserNickname = (await this.profileService.getUserProfileById(targetId)).nickname;
      //현재 방 유저에게 현재 방 정보 제공
      await  this.emitResponseEvent(socket.id, "Response-Admin-kick");
      await  this.emitOneRoomToUsersInRoom(adminDto.roomId);
      await this.emitNotice(roomToleave, `${targetUserNickname}님이 kick 당했습니다.`);
      
      //입장 가능한 방 모두에게 보내기
      await this.emitRoomsToAllConnectedUser();
    }


    @SubscribeMessage('Admin-Ban')
    async onBanSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO
    )
    {
      if (await this.amIValidUser(socket.id) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "you are not valid user.")
        return ;
      } 
      if (await this.amIInTheRoom(socket.data.userId, adminDto.roomId)  === false )
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "you are not valid user.")
        return ;
      }
      if (await this.onAdminMethods(adminDto.roomId, socket.data.userId, adminDto.targetUserId) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "You're not allowed to do that");
        return ;
      }
      // target을 현재 방의 banlist에 추가
      const updatedRoom = await this.roomService.addUserToBanList(adminDto);
      if (updatedRoom === null)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "Ther user is already banned");
        return ;

      }
      const roomToleave = await this.roomService.getRoom(adminDto.roomId);
      //  const roomToleave = await this.roomService.getRoomEntityWithCUM(adminDto.roomId);
       if (!roomToleave)
       {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "the room is not exist any more");
        return ;
       }
       const targetUserI = await this.userService.getOneUSerWithRoomsAndConnections(adminDto.targetUserId);
       if (targetUserI === undefined)
       {
         this.emitErrorEvent(socket.id, "Response-Admin-Ban", "not found user");
         return ;
        }
      const targetId = adminDto.targetUserId;
      if (roomToleave.users.find(finding => finding.id === targetId ) === undefined)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-Ban", "the user is not in the room");
        return ;
      }
        this.roomService.removeUserFromRoom(targetUserI, socket.id, roomToleave.roomId);

        const targetSocket = await this.connectedUserService.findOnebyUserId(targetId);
        if (targetSocket === undefined || targetSocket === null)
        {
          await  this.emitErrorEvent(socket.id, "Response-Admin-Ban", "the user not connected now");
        }
        else
        {
          this.server.to(targetSocket.socketId).emit(`got-baaned_${roomToleave.roomId}`);
    
          this.emitJoiningRoomsToOneUser(targetId, targetSocket.socketId);
          this.emitRoomsToOneUser(targetSocket.socketId);
        }
        
      const targetUserNickname = (await this.profileService.getUserProfileById(targetId)).nickname;

       //현재 방 유저에게 현재 방 정보 제공
      this.emitResponseEvent(socket.id, "Response-Admin-Ban");
      this.emitOneRoomToUsersInRoom(adminDto.roomId);
      this.emitAllRoomsToUsersInRoom(adminDto.roomId);
      this.emitNotice(roomToleave, `${targetUserNickname}님이 Ban 당했습니다.`);
      this.emitRoomsToAllConnectedUser();
    }
    
    @SubscribeMessage('Admin-mute')
    async onMuteSomeone(
      @ConnectedSocket() socket: Socket,
      @MessageBody() adminDto: AdminRelatedDTO)
    {
      if (await this.amIValidUser(socket.id) === false)
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "you are not valid user.")
        return ;
      } 
      if (await this.amIInTheRoom(socket.data.userId, adminDto.roomId)  === false )
      {
        this.emitErrorEvent(socket.id, "Response-Admin-mute", "you are not valid user.")
        return ;
      }
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
      this.server.to(targetSocket.socketId).emit(`got-muted_${room.roomId}`, now);
      this.emitNotice(room, `${targetProfile.nickname}님이 3분간 mute 당했습니다.`);
    }

    @SubscribeMessage('get-user-profile')
    async onGetUserProfile(
      @ConnectedSocket() socket: Socket,
      @MessageBody() targetId: number)
    {
      if (await this.amIValidUser(socket.id) === false)
      {
        this.emitErrorEvent(socket.id, "Response-get-user-profile", "you are not valid user.")
        return ;
      } 

      const profile_info = await this.profileService.getUserProfileById(targetId);
      if (!profile_info)
      {
        this.emitErrorEvent(socket.data.userId, "Response-get-user-profile", "the user not found");
        return ;
      }
      this.emitResponseEvent(socket.data.userId, "Response-get-user-profile");
      socket.emit( "user-profile-info",
           (await this.userMaaper.Create_simpleProfileEntityToDto(profile_info)));
      
    }

    @SubscribeMessage('get-users')
    async onGetUsersIntheRoom(
      @ConnectedSocket() socket: Socket,
      @MessageBody() roomId: number
    )
    {
      if (await this.amIValidUser(socket.id) === false)
      {
        this.emitErrorEvent(socket.id, "Response-get-users", "you are not valid user.")
        return ;
      } 
      if (await this.amIInTheRoom(socket.data.userId, roomId)  === false )
      {
        this.emitErrorEvent(socket.id, "Response-get-users", "you are not valid user.")
        return ;
      }
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
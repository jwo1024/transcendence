import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { In } from 'typeorm';
import { Repository } from 'typeorm';

import { roomType } from 'src/chat/types/roomTypes';

import { RoomEntity } from '../../entities/room.entity'; 
import { RoomI } from '../../interfaces/room.interface'; 
import { UserI } from '../../interfaces/user.interface'; 
import { RoomCreateDTO, RoomJoinDTO, AdminRelatedDTO, SimpleRoomDTO } from '../../dto/room.dto';

import { RoomMapper } from '../../mapper/room.mapper';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { UserEntity } from '../../entities/user.entity';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { UserService } from '../user/user.service';
import { join } from 'path';

const bcrypt = require('bcrypt');

@Injectable()
export class RoomService {

  private logger = new Logger('RoomService');

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly connectedService : ConnectedUserService,
    private readonly userService : UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>,
    private roomMapper: RoomMapper,
    ) { }

    hashPassword(password: string): string 
    {
      return bcrypt.hash(password, 12);
    }
    comparePasswords(inputPassword: string, storedPasswordHash: string): boolean 
    {
      return bcrypt.compare(inputPassword, storedPasswordHash);
    }
    
    async createBasicRoom() : Promise<RoomI>
    {
      return this.roomRepository.create({roomId : 1, 
      roomName : "BasicForChat", roomType : 'private', roomPass : 'fdfsdfad', roomOwner : null, roomAdmins : [], roomBanned : [] });
    }


  async createRoom(room: RoomCreateDTO, creator: UserI): Promise<RoomI> 
  {
    this.logger.log(`first step : ${room.roomName}, ${room.roomType}`);
   
    //비밀번호 있다면 hash화 해서 저장
    if (room.roomPass != undefined)
      room.roomPass = await this.hashPassword(room.roomPass);
		//   newUser.password = passwordHash;
    const Room_dtoToEntity = this.roomRepository.create(this.roomMapper.Create_dtoToEntity(room));
    Room_dtoToEntity.roomOwner = creator.id;
    Room_dtoToEntity.roomAdmins.push(creator.id);
    return await this.roomRepository.save(Room_dtoToEntity);
  }

  // async addUserToRoom(newUser : UserI, socketId : string, theroom: RoomEntity) : Promise<RoomI>
  // {
  //   theroom.users.push(newUser);
  //   await this.connectedService.createfast(socketId, newUser, theroom);
  //   return await this.roomRepository.save(theroom);
  // }

  async addUserToRoom(userId: number, roomId: number, socketId : string)
    : Promise<RoomEntity> 
  {
    const user = await this.userService.getOneUSerWithRoomsAndConnections(userId);
    if (!user) 
      return null;
    // const room = await this.roomRepository.({where : {roomId}});
    const room = await this.getRoomEntityWithBoth(roomId);
    if (!room) 
      return null;
    
      this.logger.log(`room users : ${room.users}`);
    if(room.users !== undefined && room.users !== null)
    {
      this.logger.log(`users in room : ${room.users.length}`);
      if(room.users.length > 0)
        this.logger.log(`users in room : ${room.users[0].id}`);
    }

    // ConnectedUserEntity 생성
    const connectedUser = new ConnectedUserEntity();
    connectedUser.user = user;
    connectedUser.room = room;
    connectedUser.socketId = socketId;
    const newConnection = await this.connectedUserRepository.save(connectedUser);
    // if (w !== undefined && w != null)
    // {
    //   this.logger.log(`w ${w}`);
    //   this.logger.log(`user ${w.user.id}`);
    //   this.logger.log(`room ${w.room.roomId}`);
    // }
    // RoomEntity에 UserEntity 추가 -> 관계성 테이블에 자동 생성
    if (!room.users) {
      room.users = [user];
    } else {
      room.users.push(user);
    }
    if (!room.connections)
      room.connections = [newConnection];
    else
      room.connections.push(newConnection);

    this.logger.log(`users: ${room.users}`);
    if(room.users)
      this.logger.log(`users: ${room.users.length}`);

    this.logger.log(`users: ${room.connections}`);
    if(room.connections)
      this.logger.log(`connections: ${room.connections.length}`);
    // RoomEntity 저장
    return this.roomRepository.save(room);
  }

  async deleteUserRoomRelationship(userId: number, roomId: number): Promise<void> 
  {
    this.logger.log(`userId ${userId}`);
    this.logger.log(`roomId ${roomId}`);

    await this.roomRepository
      .createQueryBuilder()
      .delete()
      .from('room_entity_users_user_entity')
      .where('"roomEntityRoomId" = :roomId AND "userEntityId" = :userId', { userId, roomId })
      .execute();

    this.logger.log(`done with delete relationship`);
  }

  async removeUserFromRoom(user: UserI, socketId : string, roomId: number) 
  {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .leftJoinAndSelect('room.connections', 'connections')
      .where('room.roomId = :roomId', { roomId: roomId })
      .getOne();

    const userId = user.id;
    // const userEntity = await this.userRepository.findOne({where : {id : userId}});
    
    // 사용자의 참여중인 방 목록에서 현재 방 삭제
    await this.deleteUserRoomRelationship(userId, roomId); 
    // const roomNow = await this.roomRepository.findOne({ where: {roomId: roomId}});

    await this.connectedService.removeByUserIdAndRoomId(userId, roomId);
  }

  // async deleteRoomById(user: UserI, socketId : string, roomId: number) {
  //   // 1. 방(RoomEntity)을 찾습니다.
  //   const room = await this.roomRepository.findOne({where: {roomId}});

  //   if (!room)
  //     return;

  //   // 2. 방(RoomEntity)과 연결된 사용자(UserEntity)의 rooms 배열에서 해당 방(RoomEntity)을 삭제합니다.
  //   // 이때, TypeORM에서는 자동으로 연관 관계가 해제됩니다.
  //   for (const user of room.users) {
  //     user.rooms = user.rooms.filter((userRoom) => userRoom.roomId !== roomId);
  //   }

  //   // 3. 방(RoomEntity)을 삭제합니다.
  //   await this.roomRepository.remove(room);
  // }

  async getAllRooms(): Promise<RoomI[]> {
    return await this.roomRepository.find();
  }

  async getRoom(roomId: number): Promise<RoomI> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async getRoomEntity(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      // relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async getRoomEntityWithUsers(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['users'] 
    });
    return temp;
  }

  async getRoomEntityWithMessages(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['messages'] 
    });
    return temp;
  }

  async getRoomEntityWithConnections(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['connections']
    });
    return temp;
  }

  async getRoomEntityWithBoth(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['connections', 'users'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async getRoomEntityWithCUM(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['connections', 'users', 'messages'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async isRoomExist(roomId: number) : Promise<boolean> {
    //room이 존재하는지 확인하고 true false 반환
    const room  = await this.getRoom(roomId);
    if (room !== null)
      return true;
    return false;
  }

  async isRoomOwner(userId: number, roomId: number) : Promise<boolean> 
  {
    const room = await this.getRoom(roomId);
    this.logger.log(`roomOwner : ${room.roomOwner}`);
    this.logger.log(`userId : ${userId}`);
    if (room.roomOwner === userId)
      return true;
    return false;
  }

  async isRoomAdmin(userId: number, roomId: number) : Promise<boolean> {
    const room = await this.getRoom(roomId);
    const foundId = (room.roomAdmins.find(findingId => findingId === userId))
    if (foundId)
      return true;
    return false;
  }

  async isBannedUser(userId: number, roomId: number) : Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (room.roomBanned === undefined || room.roomBanned.length === 0)
      return false;
    if (room.roomBanned.find(target => target === userId))
      return true;
    return false;
  }

  async editRoom(roomId: number, newData : RoomCreateDTO) : Promise<RoomI> 
  {
    if (newData.roomType === 'dm')
    {
      return null; //dm으로 만들어진 경우가 아닌데, dm으로 바꾸려는 경우 무시.
    }
    const editedRoom = await this.getRoomEntityWithCUM(roomId);
    // editedRoom.roomName = newData.roomName;
    editedRoom.roomType = newData.roomType;
    editedRoom.roomPass = newData.roomPass;
    
    return  this.roomRepository.save(editedRoom);
  }

  async addUserToBanList( adminDto : AdminRelatedDTO) : Promise<RoomI> 
  {
    const editedRoom = await this.getRoom(adminDto.roomId);
    if (editedRoom.roomBanned.find(target => target === adminDto.targetUserId))
      return this.getRoom(adminDto.roomId); //이미 ban 처리 되어있다면 업데이트 없이 무시
    editedRoom.roomBanned.push(adminDto.targetUserId);
    return this.roomRepository.save(editedRoom);
  }

  async addAdmintoRoom(roomId: number, targetId : number) : Promise<RoomI>
  {
    const currentRoom = await this.getRoom(roomId);
    if (currentRoom.roomAdmins.find(finding => finding === targetId))
      return currentRoom; //이미 관리자인 경우 무시
    //추가하는 시점에 유저가 users 엔테티에 있는지 확인하면 더 좋겠지만 너무 복잡해지므로 생략하겠음.
    currentRoom.roomAdmins.push(targetId);
    return this.roomRepository.save(currentRoom);
  }


  //데이터베이스에 저장된 비밀번호가 undefined가 아닌 경우, 비밀번호가 맞지 않으면 못들어감(무시)
  async isValidForJoin(roomFromDB : RoomI, joinDTO : RoomJoinDTO ) : Promise<boolean> 
  {
    //db내 비밀번호가 없는 방인 경우
    if (roomFromDB.roomPass === null)
      return true;
    
   // 방은 비밀번호가 있는데 사용자는 안 보낸 경우
    if (joinDTO.roomPass === undefined || joinDTO.roomPass === null)
    return false;

    if ((await this.comparePasswords(joinDTO.roomPass, roomFromDB.roomPass)) === true)
      return true;
    return false;
  }

    async savechangedOwner(room: RoomI)
    {
      // return await this.roomRepository.save(room);
      return await this.roomRepository.update({roomId : room.roomId}, 
        {roomOwner : room.roomOwner, 
        roomAdmins: room.roomAdmins,});
    }

  async getRoomsByType(allowedRoomTypes : roomType[]): Promise<SimpleRoomDTO[]> {
    const rooms = 
    await this.roomRepository.find({
      where: {
        roomType: In(allowedRoomTypes),
      },
    });
    return this.roomMapper.Create_simpleDTOArrays(rooms);
  }

  async getRoomsForUser(userId: number): Promise<SimpleRoomDTO[]> {
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.created_at', 'ASC')
      .getMany();
  
    return this.roomMapper.Create_simpleDTOArrays(rooms);
  }

  async deleteRoomById(roomId: number): Promise<void> {
    await this.roomRepository
      .createQueryBuilder()
      .delete()
      .from('room_entity_users_user_entity') // 조인 테이블 이름
      .where('roomEntityRoomId = :roomId', { roomId })
      .execute();
  
    // RoomEntity에서 해당 roomId를 가진 방 삭제
    await this.roomRepository.delete(roomId);
  }

  async deleteById(roomId: number) 
  {
	  	return this.roomRepository.delete({ roomId });
	}

}

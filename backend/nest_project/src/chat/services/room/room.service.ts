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

const bcrypt = require('bcrypt');

@Injectable()
export class RoomService {

  private logger = new Logger('RoomService');

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly connectedService : ConnectedUserService,
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

  async addUserToRoom(userId: number, roomId: number, socketId : string): Promise<RoomEntity> {
    // UserEntity 가져오기
    const user = await this.userRepository.findOne({where : {id : userId}});
    if (!user) {
      throw new Error('User not found');
    }

    // RoomEntity 가져오기
    const room = await this.roomRepository.findOne({where : {roomId}});
    if (!room) {
      throw new Error('Room not found');
    }

    // ConnectedUserEntity 생성
    const connectedUser = new ConnectedUserEntity();
    connectedUser.user = user;
    connectedUser.room = room;
    connectedUser.socketId = socketId;
    await this.connectedUserRepository.save(connectedUser);

    // RoomEntity에 UserEntity 추가
    if (!room.users) {
      room.users = [user];
    } else {
      room.users.push(user);
    }

    // RoomEntity 저장
    return this.roomRepository.save(room);
  }

  // async addUserToRoom(userId: number, socketId: string, theroom: RoomEntity): Promise<RoomI> 
  // {
  //   const UserEntity = await this.userRepository.findOne({where : {id : userId}});
    
  //   theroom.users.push(UserEntity);

  //   this.logger.log(`theroom : ${theroom.users[0].id}`)
  //   this.logger.log(`UserEntity : ${UserEntity.id}`)
    
  //   const newConnect = await this.connectedService.createfast(socketId, UserEntity, theroom);
    
  //   // const connection = await this.connectedService.findByUserAndRoom(UserEntity.id, theroom.roomId);
  //   if (theroom.connections === undefined)
  //     theroom.connections = [];
  //   theroom.connections.push(newConnect);
  //   if (UserEntity.connection === undefined)
  //   {
  //     // return ;
  //     UserEntity.connection = [];
  //   }
  //   UserEntity.connection.push(newConnect);    
  //   if (UserEntity.rooms === undefined)
  //     UserEntity.rooms = [];
  //   UserEntity.rooms.push(theroom);
    
  //   this.logger.log(`user = ${UserEntity.id}`);
  //   await this.userRepository.save(UserEntity);
  //   return this.roomRepository.save(theroom);
  // }

  private async deleteUserRoomRelationship(userId: number, roomId: number): Promise<void> 
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
    const userEntity = await this.userRepository.findOne({where : {id : userId}});
    
    // 사용자의 참여중인 방 목록에서 현재 방 삭제
    await this.deleteUserRoomRelationship(userId, roomId); 
    // userEntity.rooms = userEntity.rooms.filter((userRoom) => userRoom.roomId !== roomId);
    // await this.userRepository.save(userEntity);
    const roomNow = await this.roomRepository.findOne({ where: {roomId: roomId}});

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
      relations: ['connections'] //관련 엔터티도 함께 가져오겠다.
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

  async isRoomOwner(userId: number, roomId: number) : Promise<boolean> {
    const room = await this.getRoom(roomId);
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
    const editedRoom = await this.getRoom(roomId);
    editedRoom.roomName = newData.roomName;
    if (newData.roomType === 'dm')
    {
      return ; //dm으로 만들어진 경우가 아닌데, dm으로 바꾸려는 경우 무시.
      //클라이언트가 오픈 채팅 방에서만 editRoom을 부를 수 있다고 가정한다.
      //(dm은 따로 이름 설정, 비밀번호 설정, 타입 설정을 하지 않는다.)
    }
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
  async isValidForJoin(roomFromDB : RoomI, joinDTO : RoomJoinDTO ) : Promise<boolean> {
    if (joinDTO.roomPass !== undefined)
      joinDTO.roomPass = await this.hashPassword(joinDTO.roomPass);
    if (roomFromDB.roomPass === null)
      return true;
    if (joinDTO.roomPass === undefined || joinDTO.roomPass === null)
      return false;
    else if ( this.comparePasswords(joinDTO.roomPass, roomFromDB.roomPass))
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

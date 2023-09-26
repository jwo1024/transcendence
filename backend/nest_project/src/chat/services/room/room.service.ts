import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { In } from 'typeorm';
import { Repository} from 'typeorm';

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

    async hashPassword(password: string): Promise<string>
    {
      return await bcrypt.hash(password, 12);
    }
    async comparePasswords(inputPassword: string, storedPasswordHash: string): Promise<boolean>
    {
      return await bcrypt.compare(inputPassword, storedPasswordHash);
    }
    
    async createBasicRoom() : Promise<RoomI>
    {
      return this.roomRepository.create({roomId : 1, 
      roomName : "BasicForChat", roomType : 'private', roomPass : 'fdfsdfad', roomOwner : null, roomAdmins : [], roomBanned : [] });
    }


  async createRoom(room: RoomCreateDTO, creator: UserI): Promise<RoomI> 
  {
    //비밀번호 있다면 hash화 해서 저장
    if (room.roomPass != undefined)
      room.roomPass = await this.hashPassword(room.roomPass);
		//   newUser.password = passwordHash;
    const Room_dtoToEntity = await this.roomRepository.create(this.roomMapper.Create_dtoToEntity(room));
    Room_dtoToEntity.roomOwner = creator.id;
    Room_dtoToEntity.roomAdmins.push(creator.id);
    return await this.roomRepository.save(Room_dtoToEntity);
  }

  async addUserToRoom(userId: number, roomId: number, socketId : string)
    : Promise<RoomEntity> 
  {
    const user = await this.userService.getOneUSerWithRoomsAndConnections(userId);
    if (!user) 
      return null;

      const room = await this.getRoomEntityWithBoth(roomId);
    if (!room) 
      return null;
    
    // ConnectedUserEntity 생성
    const connectedUser = new ConnectedUserEntity();
    connectedUser.user = user;
    connectedUser.room = room;
    connectedUser.socketId = socketId;
    const newConnection = await this.connectedUserRepository.save(connectedUser);

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
    // RoomEntity 저장
    return await this.roomRepository.save(room);
  }

  async deleteUserRoomRelationship(userId: number, roomId: number): Promise<void> 
  {  
    await this.roomRepository
      .createQueryBuilder()
      .delete()
      .from('room_entity_users_user_entity')
      .where('"roomEntityRoomId" = :roomId AND "userEntityId" = :userId', { userId, roomId })
      .execute();

  }

  
  // const room = await this.roomRepository
  //   .createQueryBuilder('room')
  //   .leftJoinAndSelect('room.users', 'users')
  //   .leftJoinAndSelect('room.connections', 'connections')
  //   .where('room.roomId = :roomId', { roomId: roomId })
  //   .getOne();

  async removeUserFromRoom(user: UserI, socketId : string, roomId: number) 
  {
    const room = await this.getRoomEntityWithCUM(roomId);
    const userId = user.id;
    // await this.connectedService.removeByUserIdAndRoomId(userId, roomId);
    if (room.connections !== undefined)
    {
      await this.connectedService.removeByUserIdAndRoomId(user.id, roomId);
      room.connections = (room.connections.filter(user => user.id !== userId));
    }
    if (room.users !== undefined)
    {
      await this.deleteUserRoomRelationship(user.id, roomId);
      room.users = room.users.filter(user => user.id !== userId);
    }
    if (room.roomAdmins !== undefined)
    {
      room.roomAdmins = (room.roomAdmins.filter(user => user !== userId));
    }
    
    return await this.roomRepository.save(room);
  }

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
    if (newData.roomPass === undefined)
      editedRoom.roomPass = null;
    else
      editedRoom.roomPass = await this.hashPassword(newData.roomPass);
    
    return  (await this.roomRepository.save(editedRoom));
  }

  async addUserToBanList( adminDto : AdminRelatedDTO) : Promise<RoomI> 
  {
    const editedRoom = await this.getRoomEntityWithCUM(adminDto.roomId);
    if (editedRoom.roomBanned.find(target => target === adminDto.targetUserId) != undefined)
      return null; //이미 ban 처리 되어있다면 업데이트 없이 무시
    editedRoom.roomBanned.push(adminDto.targetUserId);

    return this.roomRepository.save(editedRoom);
  }

  async addAdmintoRoom(roomId: number, targetId : number) : Promise<RoomI>
  {
    const currentRoom = await this.getRoomEntityWithCUM(roomId);
    if (currentRoom.roomAdmins.find(finding => finding === targetId) !== undefined)
      return currentRoom; //이미 관리자인 경우 무시
    if (currentRoom.users.find(finding => finding.id === targetId ) === undefined)
      return null;
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

  // async deleteRoomById(roomId: number): Promise<void> {
  //   await this.roomRepository
  //     .createQueryBuilder()
  //     .delete()
  //     .where('roomEntityRoomId = :roomId', { roomId })
  //     .execute();
  //     .from('room_entity_users_user_entity') // 조인 테이블 이름
  
  //   // RoomEntity에서 해당 roomId를 가진 방 삭제
  //   // await this.roomRepository.remove(room);

  //   await this.roomRepository.delete({
  //     where : {roomId}
  //   });
  // }

  async deleteRoomById(roomId: number): Promise<void> {
    // Room 삭제
    // const room = await this.roomRepository.findOne({
    //   where : {roomId},
    //   relations : ['messages', 'connections', 'users']
    // });
    const room = await this.getRoomEntityWithCUM(roomId);
    if (!room) {
      return null;
    }
    // 연결된 모든 데이터 삭제
    await this.roomRepository.createQueryBuilder()
      .delete()
      .from('message_entity') // MessageEntity와 관련된 데이터 삭제
      .where('"roomRoomId" = :roomId', { roomId })
      .execute();

    await this.roomRepository.createQueryBuilder()
      .delete()
      .from('connected_user_entity') // ConnectedUserEntity와 관련된 데이터 삭제
      .where('"roomRoomId" = :roomId', { roomId })
      .execute();
  
      await this.roomRepository.createQueryBuilder()
      .relation(RoomEntity, 'users')
      .of(roomId)
      .remove(room.users);
    
    // Room 삭제
    const roomToDelte = await this.roomRepository.save(room);
    await this.roomRepository.delete({ roomId });
    // await this.roomRepository.remove(roomToDelte);
  }

  async deleteById(roomId: number) 
  {
	  	return this.roomRepository.delete({ roomId });
	}

}

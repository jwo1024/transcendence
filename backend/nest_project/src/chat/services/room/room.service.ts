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
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { ConnectedUserService } from '../connected-user/connected-user.service';

const bcrypt = require('bcrypt');


@Injectable()
export class RoomService {

  private logger = new Logger('RoomService');

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly connectedService : ConnectedUserService,
    private roomMapper: RoomMapper,
    ) { }

    async hashPassword(password: string): Promise<string> {
      return bcrypt.hash(password, 12);
    }
  
    async comparePasswords(password: string, storedPasswordHash: string): Promise<any> {
      return bcrypt.compare(password, storedPasswordHash);
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

  async addUserToRoom(newUser : UserI, theroom: RoomI) : Promise<RoomI>
  {
    theroom.users.push(newUser);
    const connection = await this.connectedService.findByUser(newUser);
    if (theroom.connections === undefined)
      theroom.connections = [];
    if (connection !== undefined)
    {
      this.logger.log(`conect : ${connection}, ${connection.user}`);
      this.logger.log(`conect : ${connection}`);
      this.logger.log(`theroom.connections : ${theroom.connections}`);
      theroom.connections.push(connection);
      this.logger.log(`!!!!!!!!!!!After push`);

    }
    
    this.logger.log(`!!!!!!!!!!!before save`);

    return await this.roomRepository.save(theroom);
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
    // return this.roomRepository.findOne({
    //   where: { roomId },
    //   relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    // });
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
    else if ( joinDTO.roomPass === roomFromDB.roomPass)
      return true;
    console.log("dto pass",  joinDTO.roomPass);
    console.log("room pass",  roomFromDB.roomPass);
    return false;
  }

    async savechangedOwner(room: RoomI)
    {
      return await this.roomRepository.save(room);
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
      .orderBy('room.created_at', 'DESC')
      .getMany();
  
    return this.roomMapper.Create_simpleDTOArrays(rooms);
  }

  // async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
  //   const query = this.roomRepository
  //     .createQueryBuilder('room')
  //     .leftJoin('room.users', 'users')
  //     .where('users.id = :userId', { userId })
  //     .leftJoinAndSelect('room.users', 'all_users')
  //     .orderBy('room.created_at', 'DESC');

  //   return paginate(query, options);
  // }

  async deleteById(roomId: number) {
		return this.roomRepository.delete({ roomId });
	  }

}
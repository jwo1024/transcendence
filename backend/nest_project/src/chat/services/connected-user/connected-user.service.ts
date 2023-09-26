import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { UserEntity } from 'src/chat/entities/user.entity';
import { ConnectedUserI } from 'src/chat/interfaces/connected-user.interface';
import { UserI } from 'src/chat/interfaces/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedUserService {

  private logger = new Logger('ConnectService');


  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) { }

  async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
    return this.connectedUserRepository.save(connectedUser);
  }

  async findOnebyUserId(userId : number) : Promise<ConnectedUserI> {
    return this.connectedUserRepository.findOne({
      where : { user: {id : userId}}
    }); 
  }

  async deleteAllbyUserId(userId : number) {
    // return this.connectedUserRepository.find({
    //   where : { user: {id : userId}}
    // }); 
    await this.connectedUserRepository.delete({ user: { id: userId }});
  }

  async createfast(socketId : string, user: UserI, room : RoomEntity): Promise<ConnectedUserI> {
    this.logger.log(`user : ${user.id}`);
    return this.connectedUserRepository.save({socketId, user, room });
  }

  async createfastWithRoomId(socketId : string, user: UserI, roomId : number): Promise<ConnectedUserI> 
  {
    const room = await this.roomRepository.findOne({where : {roomId}});
    return this.connectedUserRepository.save({socketId, user, room });
  }

  async getAllConnections(): Promise<ConnectedUserI[]> {
    return await this.connectedUserRepository.find();
  }

  async getByRoomId(roomId :number): Promise<ConnectedUserI[]> {
    return await this.connectedUserRepository.find({
      where: { room: {roomId : roomId}},
      // relations : ['']
    });
  }

  async getBySocketId(socketId : string) : Promise<ConnectedUserI> {
    return await this.connectedUserRepository.findOne({
      where: { socketId },
    })
  }

  async getAllConnectedSocketIds(): Promise<string[]> {
    const connectedUsers = await this.connectedUserRepository.find();

    // 중복 없는 socketId를 추출합니다.
    const uniqueSocketIds = [...new Set(connectedUsers.map(user => user.socketId))];

    return uniqueSocketIds;
  }

  async getByRoomIdWithUser(roomId: number): Promise<ConnectedUserI[]> {
    const temp = await this.connectedUserRepository.find({
      where: { room: {roomId : roomId}},
      relations: ['user'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async findByUser(user: UserI): Promise<ConnectedUserI> {
    return this.connectedUserRepository.findOne({ 
      where: {user: { id: user.id}}
    });
  }

  async findByUserAndRoom(userId: number, roomId: number)
  {
    return await this.connectedUserRepository.findOne({
      where: { user: { id: userId },
               room: { roomId: roomId } },
    });
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }

  async deleteByUserIdAndRoomId(userId: number, roomId: number): Promise<void> 
  {
    await this.connectedUserRepository.delete({ user: { id: userId }, room: { roomId } });
  }

  async removeByUserIdAndRoomId(userId: number, roomId: number,)
  {
    // 사용자(userId)와 방(roomId)에 관한 ConnectedUserEntity를 찾습니다.
    const connectedUser = await this.connectedUserRepository.findOne({
      where: { user: { id: userId }, room: { roomId: roomId } },
    });

    if (!connectedUser) {
      return ;
    }

    // ConnectedUserEntity를 삭제합니다.
    await this.connectedUserRepository.remove(connectedUser);
  }

  async deleteAll() {
    await this.connectedUserRepository
    .createQueryBuilder()
    .relation(ConnectedUserEntity, 'user')
    .of(ConnectedUserEntity) // ConnectedUserEntity 객체를 전달합니다.
    .remove([]);

  await this.connectedUserRepository
    .createQueryBuilder()
    .relation(ConnectedUserEntity, 'room')
    .of(ConnectedUserEntity) // ConnectedUserEntity 객체를 전달합니다.
    .remove([]);

  // ConnectedUserEntity 데이터 삭제
  await this.connectedUserRepository
    .createQueryBuilder()
    .delete()
    .execute();
  }
}

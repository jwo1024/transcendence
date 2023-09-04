import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { RoomEntity } from 'src/chat/entities/room.entity'; 
import { RoomI } from 'src/chat/interfaces/room.interface'; 
import { UserI } from 'src/chat/interfaces/user.interface'; 
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>
  ) { }

  async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> 
  {
    room.users.push(creator);
    room.roomOwner = creator.id;
    room.roomAdmins.set(creator.id);
    return room;
  }


//   async getRoom(roomId: number): Promise<RoomI> {
//     return this.roomRepository.findOne(roomId, {
//       relations: ['users']
//     });
//   }

  async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updated_at', 'DESC');

    return paginate(query, options);
  }



}
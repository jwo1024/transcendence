import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { RoomEntity } from '../../entities/room.entity'; 
import { RoomI } from '../../interfaces/room.interface'; 
import { UserI } from '../../interfaces/user.interface'; 
import { Repository } from 'typeorm';
import { RoomCreateDTO } from '../../dto/room-create.dto';
import { RoomMapper } from '../../mapper/room.mapper';


@Injectable()
export class RoomService {

  private logger = new Logger('RoomService');

  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private roomMapper: RoomMapper,
    ) { }

  async createRoom(room: RoomCreateDTO, creator: UserI): Promise<RoomI> {
    this.logger.log(`first step : ${room.roomName}, ${room.roomType}`);
    const Room_dtoToEntity = this.roomRepository.create(this.roomMapper.Create_dtoToEntity(room));
    // newtemp = this.roomMapper.Create_dtoToEntity(room);
    const newRoom = await this.addCreatorToRoom(Room_dtoToEntity, creator);
    this.logger.log(`second step ${newRoom.created_at},\n ${newRoom.users} ${creator.nickname}`);
    this.logger.log(`third step`);
    
    return this.roomRepository.save(newRoom);
  }

  async addCreatorToRoom(room: RoomEntity, creator: UserI): Promise<RoomI> 
  {
    this.logger.log(`creator : ${creator}, ${creator.id}`);
    this.logger.log(`room : ${room}, ${room.roomId}, ${room.roomName}`);
    
    room.users.push(creator);
    // room.users.fill(creator);
    // push(creator);
    room.roomOwner = creator.id;
    room.roomAdmins.push(creator.id);
    return room;
  }


  async getRoom(roomId: number): Promise<RoomI> {
    return this.roomRepository.findOne({
      where: { roomId },
      relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    });
  }

  async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.created_at', 'DESC');

    return paginate(query, options);
  }



}
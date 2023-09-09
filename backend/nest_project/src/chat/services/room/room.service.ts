import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { RoomEntity } from '../../entities/room.entity'; 
import { RoomI } from '../../interfaces/room.interface'; 
import { UserI } from '../../interfaces/user.interface'; 
import { Repository, TreeRepositoryUtils } from 'typeorm';
import { RoomCreateDTO, RoomJoinDTO } from '../../dto/room.dto';
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
    const newRoom = await this.addCreatorToRoom(Room_dtoToEntity, creator);

    this.logger.log(`second step ${newRoom.created_at},\n ${newRoom.users} ${creator.nickname}`);

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
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    });
    this.logger.log(`temp : ${temp.roomName}, ${temp.users[0].nickname},
       ${temp.roomOwner }`)
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

    //roomType이 protected일 경우 비밀번호가 맞아도 초대된 사용자가 아니면 못들어감(무시)
    //roomType이 private인 경우, 비밀번호가 맞지 않으면 못들어감(무시)
  isValidForJoin(roomFromDB : RoomI, joinDTO : RoomJoinDTO ) : boolean {
    // if ( roomFromDB.roomType === 'protected')
    //   return false; //따로 빼서 예외처리 굳이 안해도 될것 같다.
    if ( roomFromDB.roomType === 'open')
      return true;
    if ( roomFromDB.roomType === 'private' && joinDTO.roomPass === roomFromDB.roomPass)
      return true;
    return false;
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
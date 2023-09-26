import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { MessageEntity } from '../../entities/message.entity';
import { MessageI } from '../../interfaces/message.interface';
import { RoomI } from '../../interfaces/room.interface';
import { Repository } from 'typeorm';
import { MessageDTO } from '../../dto/message.dto';
// import { UserEntity } from '../../entities/user.entity';
import { MessageMapper } from '../../mapper/message.mapper';
import { UserI } from '../../interfaces/user.interface';

@Injectable()
export class MessageService {
  
  private logger = new Logger('MessageService');


  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private messageMapper : MessageMapper,
    ) { }
    
    async create(messageDto: MessageDTO, userId: number): Promise<MessageI> 
    {
      const newMessage 
        = await this.messageMapper.Create_dtoToEntity(messageDto, userId); 
      return await this.messageRepository.save(this.messageRepository.create(newMessage));
    }
    
    async findMessagesForRoom(room: RoomI): Promise<MessageI[]> 
    {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.room', 'room')
        .where('room.roomId = :roomId', { roomId: room.roomId })
        .leftJoinAndSelect('message.user', 'user')
        .orderBy('message.created_at', 'ASC')
        .getMany();
      
      return messages;
    }

    async deleteByRoomId(roomId : number) 
    {
      const messagesToDelete = await this.messageRepository.find({
        where: { room: { roomId: roomId } },
      });
      // ConnectedUserEntity를 삭제합니다.
      await this.messageRepository.remove(messagesToDelete);
    }
  }
    

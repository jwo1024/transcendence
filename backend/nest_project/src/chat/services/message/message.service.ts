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
    
    async create(messageDto: MessageDTO, user: UserI): Promise<MessageI> 
    {
      const newMessage 
        = await this.messageMapper.Create_dtoToEntity(messageDto); 
      return this.messageRepository.save(this.messageRepository.create(newMessage));
    }
    
    async findMessagesForRoom(room: RoomI): Promise<MessageI[]> 
    {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.room', 'room')
        .where('room.roomId = :roomId', { roomId: room.roomId })
        .leftJoinAndSelect('message.user', 'user')
        .orderBy('message.created_at', 'DESC')
        .getMany();
      
      return messages;
    }
      
  }
    

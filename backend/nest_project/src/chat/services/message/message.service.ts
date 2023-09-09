import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { MessageEntity } from '../../entities/message.entity';
import { MessageI } from '../../interfaces/message.interface';
import { RoomI } from '../../interfaces/room.interface';
import { Repository } from 'typeorm';
import { MessageDTO } from 'src/chat/dto/message.dto';
import { UserEntity } from 'src/chat/entities/user.entity';
import { MessageMapper } from 'src/chat/mapper/message.mapper';

@Injectable()
export class MessageService {
  
  private logger = new Logger('MessageService');


  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private messageMapper : MessageMapper,
    ) { }
    
    async create(messageDto: MessageDTO, user: UserEntity): Promise<MessageI> {
      // const createdMessage: MessageI = await this.messageService.create({... messageDTO, user: socket.data.user});

      return this.messageRepository.save(this.messageRepository.create(message));
    }
    
    async findMessagesForRoom(room: RoomI, options: IPaginationOptions): Promise<Pagination<MessageI>> {
      this.logger.log(`findMessages Start!`);
      const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.room', 'room')
      .where('room.roomId = :roomId', { roomId: room.roomId })
      .leftJoinAndSelect('message.user', 'user')
      .orderBy('message.created_at', 'DESC');
      
      return paginate(query, options);
      
    }
    
  }


  // @Injectable()
  // export class MessageService {
    
  // 	  constructor(
  // 		// @InjectRepository(MessageEntity)
  // 		// private readonly messageRepository: Repository<MessageEntity>
  // 	  ) { }
  
  // 	//   async findMessagesForRoom(room: RoomI, options: IPaginationOptions): Promise<Pagination<MessageI>> {
  // 	// 	const query = this.messageRepository
  // 	// 	  .createQueryBuilder('message')
  // 	// 	  .leftJoin('message.room', 'room')
  // 	// 	  .where('room.id = :roomId', { roomId: room.id })
  // 	// 	  .leftJoinAndSelect('message.user', 'user')
  // 	// 	  .orderBy('message.created_at', 'DESC');
    
  // 	// 	return paginate(query, options);
  // 	//   }	
  
  // }
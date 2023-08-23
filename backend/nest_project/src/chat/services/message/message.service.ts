import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
	
	  constructor(
		// @InjectRepository(MessageEntity)
		// private readonly messageRepository: Repository<MessageEntity>
	  ) { }

	//   async findMessagesForRoom(room: RoomI, options: IPaginationOptions): Promise<Pagination<MessageI>> {
	// 	const query = this.messageRepository
	// 	  .createQueryBuilder('message')
	// 	  .leftJoin('message.room', 'room')
	// 	  .where('room.id = :roomId', { roomId: room.id })
	// 	  .leftJoinAndSelect('message.user', 'user')
	// 	  .orderBy('message.created_at', 'DESC');
	
	// 	return paginate(query, options);
	//   }	

}

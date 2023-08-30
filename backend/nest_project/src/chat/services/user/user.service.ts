import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/chat/entities/user.entity';
import { UserI } from 'src/chat/interfaces/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	){ }

	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({ id });
	  }
}

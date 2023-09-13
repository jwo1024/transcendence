import { UserEntity } from '../../entities/user.entity';
import { UserI } from '../../interfaces/user.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';


@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) { }

	async create(newUser: UserI): Promise<UserI> {
		try {
		// const exists: boolean = await this.mailExists(newUser.email);
		// if (!exists) {
		
			const user = await this.userRepository.save(this.userRepository.create(newUser));
			return this.findOneById(user.id);
		// } else {
		//   throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
		// }
		} catch {
		throw new HttpException('the id already in use', HttpStatus.CONFLICT);
		}
	}

	async findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
		return paginate<UserEntity>(this.userRepository, options);
	}

	private async findOneById(id: number): Promise<UserI> 
	{
		return this.userRepository.findOne({ 
			where: {id},
		});
	}

	async findOneByNickname(nickname: string): Promise<UserI> 
	{
		return this.userRepository.findOne({ 
			where: {nickname},
		});
	}
	
	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({
		where: {id},
	});
	}

	async deleteById(id: number) {
		return this.userRepository.delete({ id });
	  }

	async deleteAll() {
		await this.userRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}
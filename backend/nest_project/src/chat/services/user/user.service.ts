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
		//   const passwordHash: string = await this.hashPassword(newUser.password);
		//   newUser.password = passwordHash;
			const user = await this.userRepository.save(this.userRepository.create(newUser));
			return this.findOne(user.id);
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

	// private async hashPassword(password: string): Promise<string> {
	//   return this.authService.hashPassword(password);
	// }

	// private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
	//   return this.authService.comparePasswords(password, storedPasswordHash);
	// }

	private async findOne(id: number): Promise<UserI> {
		return this.userRepository.findOne({ 
		where: {id},
	});
	}

	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({
		where: {id},
	});
	}

}
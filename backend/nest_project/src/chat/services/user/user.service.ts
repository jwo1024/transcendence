import { UserEntity } from '../../entities/user.entity';
import { UserI } from '../../interfaces/user.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { ConnectedUserI } from 'src/chat/interfaces/connected-user.interface';


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
	
	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({
		where: {id},
	});
	}
// public getOneWithAllRelations(id: number): Promise<UserEntity[] | undefined> {
	public getAllUSerWithRoomsAndConnections() : Promise<UserEntity[]>{
		return  this.userRepository.find(
			{
				relations: {connections : true, rooms : true}
			});
	}

	public getOneUSerWithRoomsAndConnections(userId : number) : Promise<UserEntity>{
		return  this.userRepository.findOne(
			{
				where: {id : userId},
				relations: ['connections', 'rooms']
			});
	}

	async getUserWithrooms(userId: number): Promise<UserEntity | undefined> 
	{
		return this.userRepository.findOne({
			where : { id : userId}, relations: ['rooms'] 
		});
	}

	async getAllUsersWithConnections(): Promise<UserEntity[] | undefined> {
		return this.userRepository.find(
		  { relations: ['connections'] });
	  }

	// async getOneUserWithConnections(): Promise<UserEntity[] | undefined> {
	// 	return this.userRepository.find(
	// 	  { relations: {connections : true} });
	// }

	// public async addBlockList(myId: number, targetId:number) : Promise<UserI>
	// {
	// 	const newMyData = await this.getOne(myId);
	// 	if (newMyData.block_list.find(finding => finding === targetId))
	// 		return newMyData; //이미 있는 경우
	// 	newMyData.block_list.push(targetId);
	// 	return await this.userRepository.save(newMyData); //update는 못쓰는지 궁금함
	// }

	// public async undoBlockList(myId: number, targetId:number) : Promise<UserI>
	// {
	// 	const newMyData = await this.getOne(myId);
	// 	if (! newMyData.block_list.find(finding => finding === targetId))
	// 		return newMyData; //이미 없는 경우
	// 	newMyData.block_list = newMyData.block_list.filter(finding => finding === targetId);
	// 	return await this.userRepository.save(newMyData); //update는 못쓰는지 궁금함
	// }

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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from './interface/game.interface';

import { ConnectedPlayerEntity } from './entities/connectedPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}

	// todo: remove
	getWindow() {return "hey";}

	async createPlayer(id:number, socketId : string): Promise<Player>
	{
		return this.connectedPlayerRepository.save({id : id, socketId: socketId});
	}

	//
	async getPlayer(id: number): Promise<Player>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "id": id }
			// relations: ['user'] // user 데이터베이스 연결되면 처리
		});
	}

	// temp code
	async getPlayerBySocketId(socketId: string): Promise<Player>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "socketId": socketId }
		});
	}
	// // temp code
	// async getPlayerBynickname(name: string): Promise<Player>
	// {
	// 	return this.connectedPlayerRepository.findOne({
	// 		where: { "nickname": name }
	// 	});
	// }

	// todo
	async deletePlayerBySocketId(socketId: string)
	// async deletePlayerBySocketId(name: string)
	{
		// await this.connectedPlayerRepository.delete({
		// 	nickname: name
		// });
		await this.connectedPlayerRepository.softDelete({
			socketId: socketId
		});
	}

	//
	async deleteAll() {
		await this.connectedPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
	
	// test code
	// async testUser()
	// {
	// 	const signUp: SignupDto = {
	// 		id: 0,
	// 		nickname: "mango",
	// 		enable2FA: false,
	// 		data2FA: "dried mango",
	// 	}

	// 	const userProf = this.profileService.signUp(signUp, "https://i.namu.wiki/i/u5liMV9Vgtp0Nt4fmxx02gY7zUWjopt68xc-5b237g7ear5eWpamAPT5URpz5NBeR2Q0gEZQpnIzAYlXkLoWl1BdZeuJdagIKYThHPi7G5o3PyiLkkBzXdwy92BCHwB4J_s6_ZZBnpAv7Enj1eMvlA.webp");
	// 	await this.userProfileRepository.insert(userProf);
	// }


}

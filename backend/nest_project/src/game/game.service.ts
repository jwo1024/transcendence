import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from './interface/game.interface';

import { PlayerEntity } from './entities/player.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(PlayerEntity) private playerRepository: Repository<PlayerEntity>,
		@InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}

	// todo: remove
	getWindow() {return "hey";}

	async createPlayer(socketId: string): Promise<Player>
	{
		// temp code
		// console.log("create player::");
		// const test = this.getPlayer(42);
		// console.log((await test));

		const player: PlayerEntity = {
			id: 42,
			ladder: 4242,
			nickname: "default",
			socketId: socketId,
		};

		// const player: PlayerEntity = {
		// 	// id: user.id,
		// 	// level: user.level,
		// 	// nickname: userInfo.nickname,
		// 	id: 42,
		// 	level: 4242,
		// 	nickname: "random player",
		// 	socketId: socketId,
		// };
		// await this.playerRepository.insert(player);
		await this.playerRepository.insert(player);

		return player;
	}

	//
	async getPlayer(playerId: number): Promise<Player>
	{
		return this.playerRepository.findOne({
			where: { "id": playerId }
			// relations: ['user'] // user 데이터베이스 연결되면 처리
		});
	}

	// temp code
	async getPlayerBySocketId(socketId: string): Promise<Player>
	{
		return this.playerRepository.findOne({
			where: { "socketId": socketId }
		});
	}
	// temp code
	async getPlayerBynickname(name: string): Promise<Player>
	{
		return this.playerRepository.findOne({
			where: { "nickname": name }
		});
	}

	// todo
	async deletePlayerBySocketId(socketId: string)
	// async deletePlayerBySocketId(name: string)
	{
		// await this.playerRepository.delete({
		// 	nickname: name
		// });
		await this.playerRepository.softDelete({
			socketId: socketId
		});
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

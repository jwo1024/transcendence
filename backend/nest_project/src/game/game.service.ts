import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from './interface/game.interface';

import { PlayerEntity } from './entities/player.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(PlayerEntity) private playerRepository: Repository<PlayerEntity>,
		@InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
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
			level: 4242,
			nickname: "default",
			socketId: socketId,
		};

		var i = 0;
		while (1)
		{
			if (await this.getPlayer(i) === null)
			{
				if (i % 2)
				{
					player.id = i;
					player.level = 42;
					player.nickname = "odd player" + i;
					player.socketId = socketId;
				}
				else
				{
					player.id = i;
					player.level = 42;
					player.nickname = "even player" + i;
					player.socketId = socketId;
				}
				break ;
			}
			else { i++; }
		}

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

	// async tempCreatePlayer(id: number): Promise<Player>
	// {
	// 	const player: PlayerEntity = {
	// 		id: id,
	// 		level: 42,
	// 		nickname: "player" + id,
	// 		socketId: "not yet",
	// 	};

	// 	return player;
	// }

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
}

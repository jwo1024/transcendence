import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlayerEntity } from './entities/player.entity';
import { Player } from './interface/game.interface';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(PlayerEntity) private playerRepository: Repository<PlayerEntity>,
		private dataSource: DataSource
	) {}

	getWindow() {return "hey";}

	async createPlayer(socketId: string): Promise<Player>
	{
		// temp code
		// console.log("create player::");
		// const test = this.getPlayer(42);
		// console.log((await test));
		const player: PlayerEntity = {
			id: 0,
			level: 0,
			nickname: "default",
			socketId: socketId,
		};
		var i = 0;
		while (1)
		{
			if (await this.getPlayer(i) === null)
			{
				player.id = i;
				player.level = 42;
				player.nickname = "random player" + i;
				player.socketId = socketId;
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
		this.playerRepository.insert(player);

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

	async deletePlayer() {}
}

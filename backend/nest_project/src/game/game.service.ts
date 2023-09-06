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
		const player: PlayerEntity = {
			// id: user.id,
			// level: user.level,
			// nickname: userInfo.nickname,
			id: 42,
			level: 4242,
			nickname: "random player",
			socketId: socketId,
		};
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

	async deletePlayer() {}
}

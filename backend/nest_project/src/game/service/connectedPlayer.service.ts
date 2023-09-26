import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Player } from '../interface/game.interface';

import { ConnectedPlayerEntity } from '../entities/connectedPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class ConnectedPlayerService {
	constructor(
		@InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,
		@InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}

	async createPlayer(id:number, socketId : string): Promise<ConnectedPlayerEntity>
	{
		return this.connectedPlayerRepository.save({id : id, socketId: socketId});
	}

	async getPlayer(id: number): Promise<ConnectedPlayerEntity>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "id": id }
		});
	}

	async getPlayerBySocketId(socketId: string): Promise<ConnectedPlayerEntity>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "socketId": socketId }
		});
	}

	// todo: temp code
	// async updateSocketId(player: ConnectedPlayerEntity, socket_id: string): Promise<ConnectedPlayerEntity>
	// {
	// 	player.socketId = socket_id;
	// 	return player;
	// }

	async getSocketIdById(id: number): Promise<string>
	{
		const player = await this.getPlayer(id);
		return player.socketId;
	}

	async getLadderById(id: number) : Promise<number>
	{
		const ladder = (await this.profileService.getUserProfileById(id)).ladder;
		return ladder;
	}

	async upLadder(id: number): Promise<UpdateResult>
	{
		const ladder = await this.getLadderById(id);
		return await this.userProfileRepository.update({id: id}, {ladder: ladder + 5});
	}

    async downLadder(id :number): Promise<UpdateResult>
	{
		const ladder = await this.getLadderById(id);
		if (ladder - 5 < 0)
		{
			return await this.userProfileRepository.update({id: id}, {ladder: 0});
		}
		return await this.userProfileRepository.update({id: id}, {ladder: ladder - 5});
    }

    async updateWins(id: number): Promise<UpdateResult>
	{
		const wins = (await this.profileService.getUserProfileById(id)).wins;
		return await this.userProfileRepository.update({id: id}, {wins: wins + 1});
    }

    async updateLoses(id: number): Promise<UpdateResult>
	{
		const loses = (await this.profileService.getUserProfileById(id)).loses;
		return await this.userProfileRepository.update({id: id}, {loses: loses + 1});
    }

	async updateRecentHistory(id: number, match_id: number): Promise<UpdateResult>
	{
		const recents = (await this.profileService.getUserProfileById(id)).recent_history;
		if (recents.length < 5)
		{
			recents.push(match_id);
			return this.userProfileRepository.update({id: id}, {recent_history: recents});
		}
		recents.shift();
		recents.push(match_id);
		return this.userProfileRepository.update({id: id}, {recent_history: recents});
	}

	async deletePlayer(id: number)
	{
		// setTimeout(() => {
		// 	this.connectedPlayerRepository.delete({id: id});
		// }, 1000);

		await this.connectedPlayerRepository.delete({id: id});
	}

	async deleteAll() {
		await this.connectedPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}

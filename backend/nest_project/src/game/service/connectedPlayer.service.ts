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

	//
	async getPlayer(id: number): Promise<ConnectedPlayerEntity>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "id": id }
			// relations: ['user'] // user 데이터베이스 연결되면 처리
		});
	}

	async getPlayerBySocketId(socketId: string): Promise<ConnectedPlayerEntity>
	{
		return this.connectedPlayerRepository.findOne({
			where: { "socketId": socketId }
		});
	}

	async upLadder(id: number): Promise<UpdateResult>
	{
		const ladder = await this.profileService.getLadderById(id);
		return await this.userProfileRepository.update({id: id}, {ladder: ladder + 5});
	}

    async downLadder(id :number): Promise<UpdateResult>
	{
		const ladder = await this.profileService.getLadderById(id);
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
		await this.connectedPlayerRepository.softDelete({id: id});
	}

	async deleteAll() {
		await this.connectedPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}

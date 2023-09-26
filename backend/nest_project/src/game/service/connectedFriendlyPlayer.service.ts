import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { GameInvitation, Player } from '../interface/game.interface';

import { ConnectedFriendlyPlayerEntity } from '../entities/connectedFriendlyPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';
import { FriendlyPlayer } from '../dto/friendlyPlayer.dto';
import { MatchService } from './match.service';
import { MatchEntity } from '../entities/match.entity';


@Injectable()
export class ConnectedFriendlyPlayerService {
	constructor(
		@InjectRepository(ConnectedFriendlyPlayerEntity) private connectedFriendlyPlayerRepository: Repository<ConnectedFriendlyPlayerEntity>,
		@InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		// @InjectRepository(MatchEntity) private matchRepository: Repository<MatchEntity>,
		private dataSource: DataSource,
		private profileService: ProfileService,
		// private matchService: MatchService,
	) {}

	async createPlayer(id:number, socketId : string): Promise<ConnectedFriendlyPlayerEntity>
	{
		return this.connectedFriendlyPlayerRepository.save({
			id : id, socketId: socketId,
			hostId: 0, guestId: 0,
			refuseGame: false, checkTimer: 0,
		});
	}

	//
	async getPlayer(id: number): Promise<ConnectedFriendlyPlayerEntity>
	{
		return this.connectedFriendlyPlayerRepository.findOne({
			where: { "id": id }
		});
	}

	async getPlayerBySocketId(socketId: string): Promise<ConnectedFriendlyPlayerEntity>
	{
		return this.connectedFriendlyPlayerRepository.findOne({
			where: { "socketId": socketId }
		});
	}

	async getSocketIdById(id: number): Promise<string>
	{
		const player = await this.getPlayer(id);
		return player.socketId;
	}

	async getHostbySocketId(socket_id: string): Promise<ConnectedFriendlyPlayerEntity>
	{
		const player = await this.getPlayerBySocketId(socket_id);
		return this.getPlayer(player.hostId);
	}

	// async getGuestbySocketId(socket_id: string): Promise<ConnectedFriendlyPlayerEntity>
	// {
	// 	const player = this.getPlayerBySocketId(socket_id);
	// 	return this.getPlayer((await player).guestId);
	// }

	async updateInvitation(player: FriendlyPlayer, invite: GameInvitation): Promise<ConnectedFriendlyPlayerEntity>
	{
		player.hostId = invite.fromUser.id;
		player.guestId = invite.toUser.id;
		return player;
	}

	async isHostPlayer(player: FriendlyPlayer): Promise<boolean>
	{
		if (!player)
		{
			console.log(`${player} no player but check,,?`);
			return false;
		}
		if (player.id === player.hostId)
			return true;
		else
			return false;
	}

	async isGuestPlayer(player: FriendlyPlayer): Promise<boolean>
	{
		if (!player)
		{
			console.log(`${player} no player but check,,?`);
			return false;
		}
		if (player.id === player.guestId)
			return true;
		else
			return false;
	}

	async refuseInvitation(guest_id: number, host_id: number): Promise<void>
	{
		const host = await this.getPlayer(host_id);
		if (!host)
			return ;
		if (host.guestId === guest_id)
		{
			await this.connectedFriendlyPlayerRepository.update({hostId: host_id}, {refuseGame: true});
		}
	}

	async deletePlayer(id: number)
	{
		const player = await this.getPlayer(id);
		if (id === player.hostId)
		{
		if (player.checkTimer)
			clearInterval(player.checkTimer);
		}
		await this.connectedFriendlyPlayerRepository.delete({id: id});
	}

	async deleteAll() {
		await this.connectedFriendlyPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}
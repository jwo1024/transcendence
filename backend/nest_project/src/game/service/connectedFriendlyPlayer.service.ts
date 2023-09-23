import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { GameInvitation, Player } from '../interface/game.interface';

import { ConnectedFriendlyPlayerEntity } from '../entities/connectedFriendlyPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';
import { FriendlyPlayer } from '../dto/friendlyPlayer.dto';

const host: number = 0;
const guest: number = 1;

@Injectable()
export class ConnectedFriendlyPlayerService {
	constructor(
		@InjectRepository(ConnectedFriendlyPlayerEntity) private connectedFriendlyPlayerRepository: Repository<ConnectedFriendlyPlayerEntity>,
		@InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}

	async createPlayer(id:number, socketId : string): Promise<ConnectedFriendlyPlayerEntity>
	{
		return this.connectedFriendlyPlayerRepository.save({id : id, socketId: socketId});
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
		const player = this.getPlayerBySocketId(socket_id);
		return this.getPlayer((await player).hostId);
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
		if (player.id === player.hostId)
			return true;
		else
			return false;
	}

	async isGuestPlayer(player: FriendlyPlayer): Promise<boolean>
	{
		if (player.id === player.guestId)
			return true;
		else
			return false;
	}

	async deletePlayer(id: number)
	{
		await this.connectedFriendlyPlayerRepository.softDelete({id: id});
	}

	async deleteAll() {
		await this.connectedFriendlyPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}

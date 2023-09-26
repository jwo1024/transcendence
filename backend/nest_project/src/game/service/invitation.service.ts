import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Player } from '../interface/game.interface';

import { MatchEntity } from '../entities/match.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { ConnectedPlayerEntity } from '../entities/connectedPlayer.entity';
import { ConnectedPlayerService } from './connectedPlayer.service';
import { FriendlyPlayer } from '../dto/friendlyPlayer.dto';
import { ConnectedFriendlyPlayerEntity } from '../entities/connectedFriendlyPlayer.entity';
import { ConnectedFriendlyPlayerService } from './connectedFriendlyPlayer.service';
import { InvitationEntity } from '../entities/invitation.entity';

@Injectable()
export class InvitationService {
	constructor(
		@InjectRepository(InvitationEntity) private invitationRepository: Repository<InvitationEntity>,
		// @InjectRepository(MatchEntity) private matchRepository: Repository<MatchEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		// @InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,
		@InjectRepository(ConnectedFriendlyPlayerEntity) private connectedFriendlyPlayerRepository: Repository<ConnectedFriendlyPlayerEntity>,
		// private dataSource: DataSource,
		// private connectedPlayerService: ConnectedPlayerService,
		// private connectedFriendlyPlayerService: ConnectedFriendlyPlayerService,
		// private profileService: ProfileService,
	) {}


	async create(host_id: number, guest_id: number): Promise<InvitationEntity>
	{
		// console.log(`초대 메서드 create입니다~`);
		// console.log(`${await this.checkInvitationOn(host_id)}`);
		// console.log(`${await this.checkInvitationOn(guest_id)}`);
		if (!(await this.checkInvitationOn(host_id)) && !(await this.checkInvitationOn(guest_id)))
			return this.invitationRepository.save({host_id: host_id, guest_id: guest_id});
		return null;
	}

	async checkInvitationOn(id: number): Promise<InvitationEntity>
	{
		const invi = await this.getByHostId(id);
		if (invi)
			return invi;
		const invi2 = await this.getByGuestId(id);
		if (invi2)
			return invi2;
		return null;
	}

	async getByHostId(host_id: number): Promise<InvitationEntity>
	{
		const invi = await this.invitationRepository.findOne({
			where: { host_id: host_id }
		});
		if (!invi)
			return null;
		return invi;
	}

	async getByGuestId(guest_id: number): Promise<InvitationEntity>
	{
		const invi = await this.invitationRepository.findOne({
			where: { guest_id: guest_id }
		});
		if (!invi)
			return null;
		return invi;
	}

	async updatePlayerByInvitation(player: FriendlyPlayer): Promise<ConnectedFriendlyPlayerEntity>
	{
		setTimeout(() => {}, 2000);
		let invitation = await this.getByHostId(player.id);
		if (!invitation)
		{
			invitation = await this.getByGuestId(player.id);
			if (!invitation)
				return null;
		}
		// console.log(`invitation service ts: `);
		// console.log(invitation);
		// if (player.id !== invitation.host_id)
		// 	return null;
		player.hostId =  invitation.host_id;
		player.guestId = invitation.guest_id;
		const temp = await this.connectedFriendlyPlayerRepository.save(player);
		return temp;
	}

	async deleteByHostId(id: number)
	{
		await this.invitationRepository.delete({ host_id: id });
	}

	//
	async deleteAll() {
		await this.invitationRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }


}

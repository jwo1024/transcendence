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
		// @InjectRepository(ConnectedFriendlyPlayerEntity) private connectedFriendlyPlayerRepository: Repository<ConnectedFriendlyPlayerEntity>,
		// private dataSource: DataSource,
		// private connectedPlayerService: ConnectedPlayerService,
		// private connectedFriendlyPlayerService: ConnectedFriendlyPlayerService,
		// private profileService: ProfileService,
	) {}


	async invite(host_id: number, guest_id: number): Promise<InvitationEntity>
	{
		return this.invitationRepository.save({host_id: host_id, guest_id: guest_id});
	}

	async getByHostId(host_id: number): Promise<InvitationEntity>
	{
		return this.invitationRepository.findOne({
			where: { host_id: host_id }
		});
	}

	async updatePlayerByInvitation(host_player: FriendlyPlayer): Promise<ConnectedFriendlyPlayerEntity>
	{
		const invitation = await this.getByHostId(host_player.id);
		// if (!invitation)
		// 	return null;
		console.log(`invitation service ts: `);
		console.log(invitation);
		if (host_player.id !== invitation.host_id)
			return null;
		host_player.hostId =  invitation.host_id;
		host_player.guestId = invitation.guest_id;
		return host_player;
	}

}

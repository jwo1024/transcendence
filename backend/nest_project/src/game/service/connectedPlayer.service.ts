import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../interface/game.interface';

import { ConnectedPlayerEntity } from '../entities/connectedPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class ConnectedPlayerService {
	constructor(
		@InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
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

	async deletePlayerBySocketId(socketId: string)
	{
		await this.connectedPlayerRepository.softDelete({
			socketId: socketId
		});
	}

	async deleteAll() {
		await this.connectedPlayerRepository
		  .createQueryBuilder()
		  .delete()
		  .execute();
	  }
}

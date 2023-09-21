import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../interface/game.interface';

import { MatchEntity } from '../entities/match.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { ConnectedPlayerEntity } from '../entities/connectedPlayer.entity';
import { ConnectedPlayerService } from './connectedPlayer.service';
// import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity) private matchRepository: Repository<MatchEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		@InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,		
		private dataSource: DataSource,
		private connectedPlayerService: ConnectedPlayerService,
		private profileService: ProfileService,
	) {}


	async create(id1:number, id2 : number, game_type : string): Promise<MatchEntity>
	{
		const player1 = await this.connectedPlayerRepository.findOne({
			where : {id : id1}});
		if (!player1)
			return null;
		const player2 = await this.connectedPlayerRepository.findOne({
			where : {id : id2}});
		if (!player2)
			return null;
		return this.matchRepository.save({playerLeft : id1, playerRight: id2, game_type: game_type, scoreLeft : 0, scoreRight : 0});
	}

	async getByMatchId(match_id: number): Promise<MatchEntity>
	{
		return this.matchRepository.findOne({
			where: { match_id }
			// relations: ['user'] // user 데이터베이스 연결되면 처리
		});
	}

	async getByPlayerId(player_id: number): Promise<MatchEntity>
	{
		const left = await  this.matchRepository.findOne({
			where: { playerLeft : player_id }});
		if (! left)
		{
			const Right =  await  this.matchRepository.findOne({
			where: { playerRight : player_id }});
			return Right;
		}
		return left;
	}

	// todo : 필요 없어지면 지우기
	async getOpponentByPlayerId(match_id: number, player_id: number): Promise<ConnectedPlayerEntity>
	{
		const match = await this.getByMatchId(match_id);
		if (match.playerLeft === player_id)
		{
			return this.connectedPlayerService.getPlayer(match.playerRight);
		}
		else
		{
			return this.connectedPlayerService.getPlayer(match.playerLeft);
		}
	}

	async updateRightScore(id: number, score : number) : Promise<void>
	{
		await this.matchRepository.update({match_id: id}, {scoreRight : score});
	}

	async updateLeftScore(id: number, score : number) : Promise<void>
	{
		await this.matchRepository.update({match_id: id}, {scoreLeft : score});
	}

	// // temp code
	// async getPlayerBySocketId(socketId: string): Promise<Player>
	// {
	// 	return this.connectedPlayerRepository.findOne({
	// 		where: { "socketId": socketId }
	// 	});
	// }

	async deleteByMatchId(match_id: number)
	{
		await this.matchRepository.delete({ match_id });
	}

	// //
	// async deleteAll() {
	// 	await this.connectedPlayerRepository
	// 	  .createQueryBuilder()
	// 	  .delete()
	// 	  .execute();
	//   }

}
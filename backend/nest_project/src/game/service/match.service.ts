import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../interface/game.interface';

import { MatchEntity } from '../entities/match.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { ConnectedPlayerEntity } from '../entities/connectedPlayer.entity';
// import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity) private matchRepository: Repository<MatchEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		@InjectRepository(ConnectedPlayerEntity) private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,		
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}

	// todo: remove
	// getWindow() {return "hey";}

	async create(id1:number, id2 : number, game_type : string): Promise<MatchEntity>
	{
		const player1 = await this.connectedPlayerRepository.findOne({
			where : {id : id1}});
		if (!player1)
			return //error 처리 !!
		const player2 = await this.connectedPlayerRepository.findOne({
			where : {id : id2}});
		if (!player2)
			return //error 처리 !!
		return this.matchRepository.save({playerLeft : id1, playerRight: id2, game_type: game_type, scoreLeft : 0, scoreRight : 0});
	}

	async getByMatchId(match_id: number): Promise<MatchEntity>
	{
		return this.matchRepository.findOne({
			where: { match_id }
			// relations: ['user'] // user 데이터베이스 연결되면 처리
		});
	}

	async getByPlayerId(player_id: number)/* : Promise<MatchEntity> */
	{
		// const match = await this.matchRepository.findOne({
		// 	where: { playerLeft: player_id }
		// });
		
		// const match = await this.matchRepository.findOne({
		// 	where: { playerRight: player_id }
		// });

		// return await ;
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
	// // // temp code
	// // async getPlayerBynickname(name: string): Promise<Player>
	// // {
	// // 	return this.connectedPlayerRepository.findOne({
	// // 		where: { "nickname": name }
	// // 	});
	// // }

	// // todo
	// async deletePlayerBySocketId(socketId: string)
	// // async deletePlayerBySocketId(name: string)
	// {
	// 	// await this.connectedPlayerRepository.delete({
	// 	// 	nickname: name
	// 	// });
	// 	await this.connectedPlayerRepository.softDelete({
	// 		socketId: socketId
	// 	});
	// }

	// //
	// async deleteAll() {
	// 	await this.connectedPlayerRepository
	// 	  .createQueryBuilder()
	// 	  .delete()
	// 	  .execute();
	//   }

}

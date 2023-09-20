import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../interface/game.interface';

import { HistoryEntity } from '../entities/history.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
// import { HistoryEntity } from '../entities/history.entity';
// import { SignupDto } from 'src/user/profile/dto/signup.dto';

@Injectable()
export class HistoryService {

	constructor(
		@InjectRepository(HistoryEntity) private historyRepository: Repository<HistoryEntity>,
		// @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
		private dataSource: DataSource,
		private profileService: ProfileService,
	) {}


	async create(win_id:number, lose_id : number, win_score: number, lose_score: number): Promise<HistoryEntity>
	{
		return this.historyRepository.save({win_user_id: win_id, lose_user_id: lose_id, win_score : win_score, lose_score : lose_score});
	}

}

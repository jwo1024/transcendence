import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { FriendlyGameGateway } from './friendlyGame.gateway';
import { LadderGameGateway } from './ladderGame.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { ConnectedPlayerEntity } from './entities/connectedPlayer.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';
import { MatchService } from './service/match.service';
import { MatchEntity } from './entities/match.entity';
import { HistoryService } from './service/history.service';
import { HistoryEntity } from './entities/history.entity';
import { UserService } from 'src/chat/services/user/user.service';
import { UserEntity } from 'src/chat/entities/user.entity';

@Module
({
	imports: [TypeOrmModule.forFeature([
		ConnectedPlayerEntity,
		UserProfile,
		MatchEntity,
		HistoryEntity,
		UserEntity,
	])],
	// exports: [TypeOrmModule],
	controllers: [GameController],
	providers: [
		LadderGameGateway,
		FriendlyGameGateway,
		ProfileService,
		MatchService,
		GameService,
		HistoryService,
		UserService,
	],
})

export class GameModule {}

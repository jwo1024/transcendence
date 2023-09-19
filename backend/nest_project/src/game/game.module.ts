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

// todo : typeorm config에 ConnectedPlayerEntity 넣기

@Module
({
	imports: [TypeOrmModule.forFeature([ConnectedPlayerEntity, UserProfile])],
	// exports: [TypeOrmModule],
	controllers: [GameController],
	providers: [GameService, LadderGameGateway, FriendlyGameGateway, ProfileService],
})

export class GameModule {}

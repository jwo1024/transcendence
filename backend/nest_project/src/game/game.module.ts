import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { FriendlyGameGateway, LadderGameGateway } from './game.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { PlayerEntity } from './entities/player.entity';
import { UserProfile } from 'src/user/profile/user-profile.entity';
import { ProfileService } from 'src/user/profile/profile.service';

// todo : typeorm config에 PlayerEntity 넣기

@Module
({
	imports: [TypeOrmModule.forFeature([PlayerEntity, UserProfile])],
	// exports: [TypeOrmModule],
	controllers: [GameController],
	providers: [GameService, LadderGameGateway, FriendlyGameGateway, ProfileService],
})

export class GameModule {}

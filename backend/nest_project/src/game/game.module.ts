import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { PlayerEntity } from './entities/player.entity';

// todo : typeorm config에 PlayerEntity 넣기

@Module
({
	imports: [TypeOrmModule.forFeature([PlayerEntity])],
	// exports: [TypeOrmModule],
	controllers: [GameController],
	providers: [GameService, GameGateway],
})

export class GameModule {}

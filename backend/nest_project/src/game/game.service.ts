import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Player) private playerRepository: Repository<Player>
	) {}

	getWindow() {return "hey";}
}

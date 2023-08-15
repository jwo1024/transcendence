import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('/game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	// 큐 대기 화면
	// 게임 화면

	@Get()
	getWindow(): string {
		return this.gameService.getWindow();
	}
}

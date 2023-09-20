export interface Player
{
	id: number;
	socketId: string;

	// 최근 전적 5개의 data(match_id)
	// latelyMatch: number[];
}

// game type: 래더, 오리지널, 커스텀(종류, 속도)
export interface MatchInfo
{
	// needed for ladder game
	matchId?: number,
	roomName: string, // matchId를 roomName로 사용하면 unique
					// friendly mode: inviter's nickname으로 unique
	playerLeft: Player,
	playerRight: Player,
	// todo: check
	gameType: string,
	customMode:string,
	scoreLeft: number,
	scoreRight: number,
}

// 퐁 캔버스, 플레이어 2명의 paddle, 퐁 ball
export interface GameField
{
	// canvas
	canvasWidth: number,
	canvasHeight: number,
	// paddle (== player)
	paddleLeftX: number,
	paddleRightX: number,
	paddleLeftY: number,
	paddleRightY: number,
	//score
	scoreLeft: number,
	scoreRight: number,
	// ball
	ballX: number,
	ballY: number,
	ballRadius: number,
	ballXvelocity: number,
	ballYvelocity: number,
	ballSpeed: number,
	// game lifetime
	gameTimer: number,
}

export interface Ball
{
	x: number,
	y: number,
	radius: number,
}

export interface Paddle
{
	x: number,
	y: number,
	width: number,
	height: number,
}

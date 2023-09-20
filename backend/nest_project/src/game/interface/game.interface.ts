export interface Player
{
	id: number;
	socketId: string;

	// 최근 전적 5개의 data(match_id)
	// latelyMatch: number[];
}

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
	// related data
	matchId: number,
	gameTimer: NodeJS.Timeout,
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

export interface Player
{
	id: number;
	nickname: string;
	level: number; // for ladder queue
	socketId: string;
}

// 내 프로필, 상대 프로필
// ongoing score
// game type: 래더, 오리지널, 커스텀(종류, 속도)
export interface MatchInfo
{
	matchId: number, // database 관리? or 서버 코드 내에서 임시 변수로 관리? // 데이터베이스에는 serial match_id
	roomName: string,
	playerLeft: Player,
	playerRight: Player,
	gameType: string,
	customMode:string,
	scoreLeft: number,
	scoreRight: number,
}

// 퐁 캔버스, 플레이어 2명의 bar, 퐁 ball
export interface GameField
{
	// canvas
	canvasWidth: number,
	canvasHeight: number,
	// paddle (== player)
	paddleLeftX: number,
	paddleLeftY: number,
	paddleRightX: number,
	paddleRightY: number,
	// ball
	ballX: number,
	ballY: number,
	ballRadius: number,
	ballXvelocity: number,
	ballYvelocity: number,
	ballSpeed: number,
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

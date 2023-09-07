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
	playerLeft: string,
	playerRight: string,
	gameType: string,
	customType:string,
	scoreLeft: number,
	scoreRight: number,
}

// 퐁 캔버스, 플레이어 2명의 bar, 퐁 ball
export interface GameField
{
	// canvas
	canvasLeft: number,
	canvasRight: number,
	canvasUp: number,
	canvasBottom: number,
	paddleLeftY: number,
	paddleRightY: number,
	ballX: number,
	ballY: number,
}
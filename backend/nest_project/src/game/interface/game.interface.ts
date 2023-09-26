export interface Player {
  id: number;
  socketId: string;
}

export interface playerProfile {
  nickname: string;
  ladder: number;
  wins: number;
  loses: number;
}

// for friendly game
export interface InviteUser {
  id: number;
  nickname: string;
}

// for friendly game
export interface GameInvitation {
  fromUser: InviteUser;
  toUser: InviteUser;
}

export interface GameField {
  // canvas
  canvasWidth: number;
  canvasHeight: number;
  // paddle (== player)
  paddleLeftX: number;
  paddleRightX: number;
  paddleLeftY: number;
  paddleRightY: number;
  //score
  scoreLeft: number;
  scoreRight: number;
  // ball
  ballX: number;
  ballY: number;
  ballRadius: number;
  ballXvelocity: number;
  ballYvelocity: number;
  ballSpeed: number;
  // related data
  matchId: number;
  gameTimer: NodeJS.Timeout;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaddlePair {
  leftY: number;
  rightY: number;
}

export interface CanvasChange {
  ballX: number;
  ballY: number;
  veloX: number;
  veloY: number;
  ballSpeed: number;
  leftScore: number;
  rightScore: number;
  ballRadius: number;
}

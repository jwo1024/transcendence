export interface resultNickname {
  winPlayer: string;
  losePlayer: string;
}

export interface playerProfile {
  nickname: string;
  ladder: number;
  wins: number;
  loses: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
}

export interface Net {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  color: string;
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

import { Ball, CanvasChange, Net, Paddle, PaddlePair } from "@/types/GameType";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface PongGameProps {
  socket: Socket;
}

type paddleSize = {
  width: number;
  height: number;
};
const PaddleSize: paddleSize = {
  width: 10,
  height: 100,
};

type canvasSize = {
  width: number;
  height: number;
};
const CanvasSize: canvasSize = {
  width: 800,
  height: 600,
};

type ballSpec = {
  radius: number;
  speed: number;
};
const BallSpec: ballSpec = {
  radius: 10,
  speed: 3,
};

const PongGame: React.FC<PongGameProps> = ({ socket }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(
    canvasRef.current
  );

  const left: Paddle = {
    x: 0,
    y: CanvasSize.height / 2 - PaddleSize.height / 2,
    width: PaddleSize.width,
    height: PaddleSize.height,
    color: "white",
    score: 0,
  };
  const right: Paddle = {
    x: CanvasSize.width - PaddleSize.width,
    y: CanvasSize.height / 2 - PaddleSize.height / 2,
    width: PaddleSize.width,
    height: PaddleSize.height,
    color: "white",
    score: 0,
  };
  const net: Net = {
    x: CanvasSize.width / 2 - 2 / 2,
    y: 0,
    width: 2,
    height: 10,
    color: "red",
  };
  const ball: Ball = {
    x: CanvasSize.width / 2,
    y: CanvasSize.height / 2,
    radius: BallSpec.radius,
    speed: BallSpec.speed,
    velocityX: BallSpec.speed,
    velocityY: BallSpec.speed,
    color: "white",
  };
  const framePerSecond = 50;

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.on("paddleMove", (data: PaddlePair) => {
      left.y = data.leftY;
      right.y = data.rightY;
    });

    // todo: change name
    socket.on("updateCanvas", (data: CanvasChange) => {
      ball.x = data.ballX;
      ball.y = data.ballY;
      ball.velocityX = data.veloX;
      ball.velocityY = data.veloY;
      ball.speed = data.ballSpeed;

      left.score = data.leftScore;
      right.score = data.rightScore;

      ball.radius = data.ballRadius;
    });

    // rendering function

    function drawRect(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string
    ) {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      }
    }

    function drawCircle(x: number, y: number, r: number, color: string) {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }
    }

    function drawText(text: string, x: number, y: number, color: string) {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = "75px d2Coding";
        ctx.fillText(text, x, y);
      }
    }

    function drawNet() {
      if (canvas) {
        for (let i = 0; i <= canvas.height; i += 15) {
          drawRect(net.x, net.y + i, net.width, net.height, net.color);
        }
      }
    }

    function render() {
      if (canvas) {
        drawRect(0, 0, canvas.width, canvas.height, "black");
        drawRect(left.x, left.y, left.width, left.height, left.color);
        drawRect(right.x, right.y, right.width, right.height, right.color);
        drawNet();
        drawText(
          left.score.toString(),
          canvas.width / 4,
          canvas.height / 5,
          "WHITE"
        );
        drawText(
          right.score.toString(),
          canvas.width * (3 / 4),
          canvas.height / 5,
          "WHITE"
        );
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
      }
    }

    function movePaddle(event: MouseEvent) {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top - left.height / 2;
        socket.emit("mouseMove", mouseY);
      }
    }

    canvas.addEventListener("mousemove", movePaddle);

    // function game() {
    //   render();
    // }
    // setInterval(game, 1000 / framePerSecond);

    // 게임 루프 시작
    const intervalId = setInterval(() => {
      render();
    }, 1000 / framePerSecond);

    // 컴포넌트가 언마운트되면 clearInterval을 사용하여 게임 루프를 정리합니다.
    return () => clearInterval(intervalId);
  }, [canvas]);

  return (
    <canvas
      ref={canvasRef}
      width={CanvasSize.width}
      height={CanvasSize.height}
      className="bg-black"
    ></canvas>
  );
};

export default PongGame;

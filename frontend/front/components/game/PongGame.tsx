import { data } from "autoprefixer";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

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

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
}

interface Net {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  color: string;
}

interface PongGameProps {
  socket: Socket
}

const PongGame: React.FC<PongGameProps> = ({socket/* paddleLeftY, paddleRightY */}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(
    canvasRef.current
  );
  const [user, setUser] = useState<Paddle>({
    x: 0,
    y: CanvasSize.height / 2 - PaddleSize.height / 2,
    width: PaddleSize.width,
    height: PaddleSize.height,
    color: "white",
    score: 0,
  });
  const [com, setCom] = useState<Paddle>({
    x: CanvasSize.width - PaddleSize.width,
    y: CanvasSize.height / 2 - PaddleSize.height / 2,
    width: PaddleSize.width,
    height: PaddleSize.height,
    color: "white",
    score: 0,
  });
  const [net, setNet] = useState<Net>({
    x: CanvasSize.width / 2 - 2 / 2,
    y: 0,
    width: 2,
    height: 10,
    color: "red",
  });
  const [ball, setBall] = useState<Ball>({
    x: CanvasSize.width / 2,
    y: CanvasSize.height / 2,
    radius: BallSpec.radius,
    speed: BallSpec.speed,
    velocityX: BallSpec.speed,
    velocityY: BallSpec.speed,
    color: "white",
  });
  const [framePerSecond] = useState(50);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    socket.on('paddleMove', (data) => {
      user.y = data.paddleLeftY;
      com.y = data.paddleRightY;
      // console.log(socket.id);
      // console.log(user.y);
      // console.log(com.y);
    });

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

    function resetBall() {
      if (canvas) {
        ball.x = CanvasSize.width / 2;
        ball.y = CanvasSize.height / 2;
        ball.speed = BallSpec.speed;
        ball.velocityX = BallSpec.speed;
      }
    }

    function collision(b: Ball, p: Paddle) {
      const paddleLocation = {
        top: p.y,
        bottom: p.y + p.height,
        left: p.x,
        right: p.x + p.width,
      };
      const ballLocation = {
        top: b.y - b.radius,
        bottom: b.y + b.radius,
        left: b.x - b.radius,
        right: b.x + b.radius,
      };
      return (
        ballLocation.right > paddleLocation.left &&
        ballLocation.left < paddleLocation.right &&
        ballLocation.top < paddleLocation.bottom &&
        ballLocation.bottom > paddleLocation.top
      );
    }

    function update() {
      if (canvas) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // simple AI
        // com.y += (ball.y - (com.y + com.height / 2)) * 0.1;
        
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
          ball.velocityY = -ball.velocityY;
        }

        let player = ball.x + ball.radius < canvas.width / 2 ? user : com;
        if (collision(ball, player)) {
          let collidePoint =
            (ball.y - (player.y + player.height / 2)) / (player.height / 2);
          let angleRad = (Math.PI / 4) * collidePoint;

          let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;

          ball.velocityX = direction * ball.speed * Math.cos(angleRad);
          ball.velocityY = ball.speed * Math.sin(angleRad);

          ball.speed += 0.1;
        }

        if (ball.x - ball.radius < 0) {
          com.score++;
          resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
          user.score++;
          resetBall();
        }
      }
    }

    function render() {
      if (canvas) {
        drawRect(0, 0, canvas.width, canvas.height, "black");
        drawRect(user.x, user.y, user.width, user.height, user.color);
        drawRect(com.x, com.y, com.width, com.height, com.color);
        drawNet();
        drawText(
          user.score.toString(),
          canvas.width / 4,
          canvas.height / 5,
          "WHITE"
        );
        drawText(
          com.score.toString(),
          canvas.width * (3 / 4),
          canvas.height / 5,
          "WHITE"
        );
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
      }
    }

    function game() {
      update();
      render();
    }

    setInterval(game, 1000 / framePerSecond);

    function movePaddle(event: any) {
      if (canvas) {
        let rect = canvas.getBoundingClientRect();
        // user.y = event.clientY - rect.top - user.height / 2;
        const mouseY = event.clientY - rect.top - user.height / 2;
        socket.emit("mouseMove", mouseY);
      }
    }

    canvas.addEventListener("mousemove", movePaddle);

    // 게임 루프 시작
    const intervalId = setInterval(() => {
      update();
      render();
    }, 1000 / framePerSecond);

    // 컴포넌트가 언마운트되면 clearInterval을 사용하여 게임 루프를 정리합니다.
    return () => clearInterval(intervalId);
  }, [canvas, user, com, net, ball, framePerSecond]);

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

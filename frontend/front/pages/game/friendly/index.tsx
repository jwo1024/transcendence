import React, { useState } from "react";
import { ThemeProvider } from "@react95/core";
import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import io from 'socket.io-client';
import GameLoading from "@/components/game/GameLoading";
import GameResult from "@/components/game/GameResult";
// todo: token 필요 시 socket과 함께 백에 넘겨야 함
// const token = sessionStorage.getItem(“accessToken”);
//   const socket = io('http://localhost:4000/ladder_game', {
//     extraHeaders: {
//         Authorization: `Bearer ${token}`
//     }
// });
const socket = io('http://localhost:4000/friendly_game');

export default function GamePage() {

  const [left, setLeft] = useState({
    nickname: "left player",
    ladder: 1000,
    win: 0,
    lose: 0,
  });
  const [right, setRight] = useState({
    nickname: "right player",
    ladder: 1000,
    win: 0,
    lose: 0,
  });

  const [gameStart, setGameStart] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [winNickName, setWinNickName] = useState("");
  const [loseNickName, setLoseNickName] = useState("");

  socket.on("setMiniProfile", (profile1: any, profile2: any) => {
    setLeft({
      nickname: profile1.nickname,
      ladder: profile1.level,
      win: profile1.wins,
      lose: profile1.loses,
    });
    setRight({
      nickname: profile2.nickname,
      ladder: profile2.level,
      win: profile2.wins,
      lose: profile2.loses,
    });
  });

  socket.on('startGame', () => {
    setGameStart(true);
  });

  socket.on('endGame', (winner_nickname, loser_nickname) => {
      setWinNickName(winner_nickname);
      setLoseNickName(loser_nickname);
      setGameEnd(true);
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          {!gameStart && !gameEnd ? (
            <GameLoading />
          ) : gameStart && !gameEnd ? (
            <PongGame socket={socket} />
          ) : (
            /* 승자와 패자 닉네임을 string으로 전달 */ <GameResult
              win={winNickName}
              lose={loseNickName}
            />
          )}
          <div className="flex mt-10 w-[800px] items-center justify-between">
            <MiniProfile
              nickname={left.nickname}
              ladder={left.ladder}
              win={left.win}
              lose={left.lose}
              avatarSrc="https://github.com/React95.png"
            />
            <img className="h-40 mx-10" src="versus.png" />
            <MiniProfile
              nickname={right.nickname}
              ladder={right.ladder}
              win={right.win}
              lose={right.lose}
              avatarSrc="https://github.com/React95.png"
            />
          </div>
        </div>
      </Window>
    </div>
  );
}
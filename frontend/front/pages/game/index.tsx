import React, { useState } from "react";
import { ThemeProvider } from "@react95/core";
import { useRouter } from "next/router";

import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import GameLoading from "@/components/game/GameLoading";
import GameResult from "@/components/game/GameResult";

import io from "socket.io-client";
// todo: token 필요 시 socket과 함께 백에 넘겨야 함
// const token = sessionStorage.getItem(“accessToken”);
//   const socket = io('http://localhost:4000/ladder_game', {
//     extraHeaders: {
//         Authorization: `Bearer ${token}`
//     }
// });
const socket = io("http://localhost:4000/ladder_game");

export default function GamePage() {

  // todo: 게임 종료 후 router 작동
  const router = useRouter();
  //router.push("http://localhost:3001/~");

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

  // 사용법
  // setGameStart(true); 를 적어주면 <PongGame/>컴포넌트가 생성된다.
  const [gameStart, setGameStart] = useState(false);
  // setGameEnd(true); 를 적어주면 게임이 종료된다.
  const [gameEnd, setGameEnd] = useState(false);
  // setWinNickName("이긴닉네임"); setLoseNickName("진닉네임"); 쓰면 됨
  const [winNickName, setWinNickName] = useState("");
  const [loseNickName, setLoseNickName] = useState("");

  //소켓이 연결되면 setGameStart(true);가 되어야 게임시작됨

  //게임이 끝나면 백엔드로부터 정보를 받은 후
  // setWinNickName("nick"); setLoseNickName("nick"); 설정 후에
  // setGameEnd(true); 가 되어야함.

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
            <span className=" text-9xl">VS</span>
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

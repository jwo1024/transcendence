import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import GameLoading from "@/components/game/GameLoading";
import GameResult from "@/components/game/GameResult";
import { resultNickname } from "@/types/GameType";

import io from "socket.io-client";

const token = sessionStorage.getItem("accessToken");
const socket = io('http://localhost:4000/ladder_game', {
extraHeaders: {
    Authorization: `Bearer ${token}`
}
});

// const socket = io("http://localhost:4000/ladder_game");


export default function GamePage() {

  const router = useRouter();
  // const [token, setToken] = useState<string | null>(null);
  // const [socket, setSocket] = useState<Socket | null>(null);

  socket.on("disconnect", (reason) => {
    // todo: remove
    console.log("disconnect!");
    // socket.disconnect();
    setTimeout(() => {router.push("/menu");}, 3000);
  });

  const [left, setLeft] = useState({
    nickname: "searching...",
    ladder: 0,
    win: 0,
    lose: 0,
  });
  const [right, setRight] = useState({
    nickname: "searching...",
    ladder: 0,
    win: 0,
    lose: 0,
  });

  // const [gameStart, setGameStart] = useState(false);
  // const [gameEnd, setGameEnd] = useState(false);
  // const [winNickName, setWinNickName] = useState("");
  // const [loseNickName, setLoseNickName] = useState("");
  const [resultOfGame, setResultOfGame] = useState<resultNickname>({winPlayer:"",losePlayer:""})


  const [gamePhase, setGamePhase] = useState<"wait" | "start" | "end">("wait");


  socket.on("setMiniProfile", (profile1: any, profile2: any) => {
    setLeft({
      nickname: profile1.nickname,
      ladder: profile1.ladder,
      win: profile1.wins,
      lose: profile1.loses,
    });
    setRight({
      nickname: profile2.nickname,
      ladder: profile2.ladder,
      win: profile2.wins,
      lose: profile2.loses,
    });
  });

  socket.on('startGame', () => {
    setGamePhase("start");
  });

  socket.on('endGame', (winner_nickname, loser_nickname) => {
      // setWinNickName(winner_nickname);
      // setLoseNickName(loser_nickname);
      setResultOfGame({winPlayer:winner_nickname, losePlayer:loser_nickname});
      setGamePhase("end");
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          {gamePhase === "wait" ? (
            <GameLoading />
          ) : gamePhase === "start" ? (
            <PongGame socket={socket} />
          ) : (
            /* 승자와 패자 닉네임을 string으로 전달 */ <GameResult
              result={resultOfGame}
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

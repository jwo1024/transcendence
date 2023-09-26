import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import GameLoading from "@/components/game/GameLoading";
import GameResult from "@/components/game/GameResult";
import { playerProfile, resultNickname } from "@/types/GameType";

import io, { Socket } from "socket.io-client";

import {
  ON_ERROR,
  ON_CONNECT,
  ON_DISCONNECT,
} from "@/types/ChatSocketEventName";

export default function GamePage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [resultOfGame, setResultOfGame] = useState<resultNickname>({
    winPlayer: "",
    losePlayer: "",
  });
  const [gamePhase, setGamePhase] = useState<"wait" | "start" | "end">("wait");
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

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // tmp
    setSocket(
      io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ladder_game`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    console.log("gameSocket : Mount");
    return () => {
      if (socket) socket.close();
      setSocket(null);
      console.log("gameSocket : Unmount");
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      // router.push(`${errorPage}?error=socket_problem`);
      return;
    }
    socket.on(ON_CONNECT, () => {
      console.log(`Socket ${socket.id} connected`);
    });

    socket.on(ON_DISCONNECT, (reason) => {
      // console.error(`Socket connection failed: ${socket.id}`, reason);
      console.log(`Socket Disconnected : `, reason);
      setTimeout(() => {
        router.push("/menu");
      }, 3000);
    });

    socket.on(ON_ERROR, (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });

    socket.on(
      "setMiniProfile",
      (profile1: playerProfile, profile2: playerProfile) => {
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
      }
    );

    socket.on("startGame", () => {
      setGamePhase("start");
    });

    socket.on("endGame", (winner_nickname, loser_nickname, check) => {
      setResultOfGame({
        winPlayer: winner_nickname,
        losePlayer: loser_nickname,
      });
      check();
      setGamePhase("end");
    });

    return () => {
      const token = sessionStorage.getItem("accessToken");
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/ladder`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
        })
        .then((data) => {
          sessionStorage.setItem("user", JSON.stringify(data));
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });

      socket?.removeAllListeners();
      socket?.disconnect();
      socket?.close();
    };
  }, [socket]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          {gamePhase === "wait" ? (
            <GameLoading />
          ) : gamePhase === "start" ? (
            <PongGame socket={socket!} />
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

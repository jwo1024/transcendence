import React, { useEffect, useState } from "react";
import { Button } from "@react95/core";
import { useRouter } from "next/router";

import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import GameLoading from "@/components/game/GameLoading";
import GameResult from "@/components/game/GameResult";
import { resultNickname } from "@/types/GameType";

import {
  ON_ERROR,
  ON_CONNECT,
  ON_DISCONNECT,
} from "@/types/ChatSocketEventName";

// const socket = io('http://localhost:4000/friendly_game');

interface SimpUserI
{
  id: number;
  nickname: string;
}

interface gameInvitationI{
	fromUser: SimpUserI;
	toUser: SimpUserI;
}

// todo:
// const invitation = sessionStorage.getItem("gameInvitation");
// const invitationObj = JSON.parse(invitation);
const user1: SimpUserI =
{
  id: 12345,
  nickname: "mango"
}
const user2: SimpUserI =
{
  id: 67890,
  nickname: "watermelon"
}
const invite: gameInvitationI =
{
  fromUser: user1,
  toUser: user2
}

import io, { Socket } from 'socket.io-client';

  // const token = sessionStorage.getItem("accessToken");
//   const socket = io('http://localhost:4000/friendly_game', {
//     extraHeaders: {
//         Authorization: `Bearer ${token}`
//     }
// });



export default function GamePage() {
  
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [resultOfGame, setResultOfGame] = useState<resultNickname>({winPlayer:"",losePlayer:""})
  const [gamePhase, setGamePhase] = useState<"wait" | "start" | "end">("wait");
  const [isInvited, setIsInvited] = useState(false);
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
  const [mode, setMode] = useState<string |null>("normal");

  const modeSelect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clickedButton = event.nativeEvent.submitter.name;
    setMode(clickedButton);
    // console.log(clickedButton);
    // clickedButton = "normal" | "speedUp" | "smallBall" | "enjoyAll";
    }

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // tmp
    setSocket(
      io('http://localhost:4000/friendly_game', {
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

  useEffect(()=>{
    if(!socket) return;
    socket.emit("chooseGameType", mode);
  }, [mode]);

  useEffect(() => {
    if (!socket) {
      // router.push(`${errorPage}?error=socket_problem`);
      return;
    }
    socket.on(ON_CONNECT, () => {
      console.log("Socket connected");
    });
    // Socket 연결 실패 시
    socket.on(ON_DISCONNECT, (error) => {
      console.error("Socket connection failed:", error);
      setTimeout(() => {router.push("/menu");}, 3000);
    });

    socket.on(ON_ERROR, (error) => {
      console.error("Socket error:", error);
    });


  // socket.on(ON_DISCONNECT, (reason) => {
  //   // todo: remove
  //   console.log("disconnect!");
  //   socket.disconnect();
  //   setTimeout(() => {router.push("/menu");}, 3000);
  // });

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

    socket.on("savePlayer", (callback) => {
      callback(invite);
    });

    socket.on("guestArrive", () => {
      useEffect(() => {setIsInvited(true)}, []);
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

    return () => {
      socket?.off(ON_CONNECT);
      socket?.off(ON_DISCONNECT);
      socket?.off("setMiniProfile");
      socket?.off("savePlayer");
      socket?.off("guestArrive");
      socket?.off("startGame");
      socket?.off("endGame");
      socket?.disconnect();
      socket?.close();
    };
  }, [socket]);

  

  // socket.on('refuseGame', () => {
  //   router.push("/menu");
  // });

    return (
      <div className="flex items-center justify-center h-screen">
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          {gamePhase === "wait" && isInvited ? (<form
          onSubmit={modeSelect}
          className="flex flex-col items-center w-[800px] h-[600px] bg-gray-500 justify-center space-y-6 "
        >
          <Button className="w-60 h-16" name="normal"><span className="text-5xl">Normal</span></Button>
          <Button className="w-60 h-16" name="speedUp"><span className="text-5xl">Speed Up</span></Button>
          <Button className="w-60 h-16" name="smallBall"><span className="text-5xl">Small Ball</span></Button>
          <Button className="w-60 h-16" name="enjoyAll"><span className="text-5xl">Enjoy all</span></Button>
        </form>) : gamePhase === "wait" && !isInvited ? (
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
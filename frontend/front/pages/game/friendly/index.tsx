import React, { useState } from "react";
import { ThemeProvider } from "@react95/core";
import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

// socket.io 백엔드와 연결
import io from 'socket.io-client';
const socket = io('http://localhost:4000/friendly_game');
console.log(socket);

export default function GamePage() {

  // miniprofile unit test를 위한 temp variables
  const [left, setLeft] = useState({ nickname: "pLeft.nickname", ladder: 23, })
  const [right, setRight] = useState({ nickname: "pRight.nickname", ladder: 42, })

  const startGameHandler = () => {
    socket.emit('startGame');
    socket.on('setMiniProfile', (pLeft, pRight, callback) => {
      setLeft({nickname: pLeft.nickname, ladder:pLeft.level})
      setRight({nickname: pRight.nickname, ladder:pRight.level})
      callback();
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button onClick={startGameHandler}>START GAME</button>
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          <PongGame socket={socket}/>
          <div className="flex mt-10 w-[800px] items-center justify-between">
            <MiniProfile
              nickname={left.nickname}
              ladder={left.ladder}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
            <img className="h-40 mx-10" src="versus.png" />
            <MiniProfile
              nickname={right.nickname}
              ladder={right.ladder}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
          </div>
        </div>
      </Window>
    </div>
  );
}
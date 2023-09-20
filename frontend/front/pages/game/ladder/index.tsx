import React, { useState } from "react";
import { ThemeProvider } from "@react95/core";
import Window from "@/components/common/Window";
import MiniProfile from "@/components/game/MiniProfile";
import PongGame from "@/components/game/PongGame";

import io from 'socket.io-client';
// todo: token 필요 시 socket과 함께 백에 넘겨야 함
// const token = sessionStorage.getItem(“accessToken”);
//   const socket = io('http://localhost:4000/ladder_game', {
//     extraHeaders: {
//         Authorization: `Bearer ${token}`
//     }
// });
const socket = io('http://localhost:4000/ladder_game');

export default function GamePage() {

  // miniprofile unit test를 위한 temp variables
  const [left, setLeft] = useState({ nickname: "pLeft.nickname", ladder: 23, })
  const [right, setRight] = useState({ nickname: "pRight.nickname", ladder: 42, })

  //  todo: main 화면의 래더 버튼과 연동되어야 함  or setGame() 시작 시 setMiniProfile 이벤트 발생
  const startGameHandler = () => {
    socket.emit('startGame');
    socket.on('setMiniProfile', (pLeft: any, pRight: any, callback: any) => {
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

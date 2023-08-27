import MiniProfile from "@/components/game/MiniProfile";
import React from "react";
import { ThemeProvider } from "@react95/core";
import Window from "@/components/common/Window";

export default function GamePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Window title="pong game" w="900" h="850">
        <div className="h-screen flex flex-col justify-center items-center">
          <div className="bg-black w-[800px] h-[600px]"></div>
          <div className="flex mt-10 w-[800px] items-center justify-between">
            <MiniProfile
              nickname="JohnDoe"
              ladder={2134}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
            <img className="h-40 mx-10" src="versus.png" />
            <MiniProfile
              nickname="JohnDoe"
              ladder={2134}
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

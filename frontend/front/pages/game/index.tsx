import MiniProfile from "@/components/game/MiniProfile";
import React from "react";
import Window from "@/components/common/Window";
import { ThemeProvider } from "@react95/core";

export default function GamePage() {
  return (
    <div className="flex items-center justify-center h-90vh">
      <Window title="pong game" w="740" h="500">
        <ThemeProvider>
          <div className="h-screen flex flex-col justify-center items-center">
            <div className="bg-black w-[600px] h-80"></div>
            <div className="flex mt-10">
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
        </ThemeProvider>
      </Window>
    </div>
  );
}

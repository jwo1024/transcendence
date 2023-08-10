import MiniProfile from "@/components/game/MiniProfile";
import React from "react";

export default function GamePage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div>game</div>
      <div className="flex mt-20">
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
  );
}

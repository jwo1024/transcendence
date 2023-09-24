import React from "react";
import { resultNickname } from "@/types/GameType";

interface gameResultProps {
  result:resultNickname;
}


// win, lose는 string이며 닉네임을 적어주세요
const GameResult: React.FC<gameResultProps> = ({result}) => {
  return (
    <div className="flex items-center w-[800px] h-[600px] bg-black justify-center">
      <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
        <div className="flex flex-col items-center justify-center">
          <span className=" text-6xl text-green-500">win</span>
          <span className="text-4xl text-white">{result.winPlayer}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className=" text-6xl text-red-500">lose</span>
          <span className="text-4xl text-white">{result.losePlayer}</span>
        </div>
      </div>
    </div>
  );
};

export default GameResult;

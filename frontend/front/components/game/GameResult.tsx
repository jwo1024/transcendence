import React from "react";

interface GameResultProps {
  win: string;
  lose: string;
}

// win, lose는 string이며 닉네임을 적어주세요
const GameResult: React.FC<GameResultProps> = ({ win, lose }) => {
  return (
    <div className="flex items-center w-[800px] h-[600px] bg-black justify-center">
      <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
        <div className="flex flex-col items-center justify-center">
          <span className=" text-6xl text-green-500">win</span>
          <span className="text-4xl text-white">{win}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className=" text-6xl text-red-500">lose</span>
          <span className="text-4xl text-white">{lose}</span>
        </div>
      </div>
    </div>
  );
};

export default GameResult;

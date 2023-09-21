import React from "react";

const GameLoading: React.FC = () => {
  return (
    <div className="flex items-center w-[800px] h-[600px] bg-black justify-center">
      <span className=" text-6xl text-white">
        Please wait for a few seconds....
      </span>
    </div>
  );
};

export default GameLoading;

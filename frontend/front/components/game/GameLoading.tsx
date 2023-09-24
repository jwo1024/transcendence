import { Button } from "@react95/core";
import { useRouter } from "next/router";
import React from "react";



const GameLoading: React.FC = () => {
  const router = useRouter();

  const backToMenu = ()=>{
    router.push("/menu")
  }
  return (
    <div className="flex flex-col items-center w-[800px] h-[600px] bg-black justify-center space-y-5">
      <span className=" text-6xl text-white">
        Please wait for a few seconds....
      </span>
      <Button onClick={backToMenu}><span className="text-2xl">Cancel and go back to menu</span></Button>
    </div>
  );
};

export default GameLoading;
  
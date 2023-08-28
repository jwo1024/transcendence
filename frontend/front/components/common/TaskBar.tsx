import React, { createContext } from "react";
import { Frame, Button, List } from "@react95/core";
import Image from "next/image";
import SelectButton from "./SelectButton";
import type { FrameButtonProps } from "./SelectButton";


export const CurrentPageState = createContext("Home Page");
export const WindowDispatchContext = createContext([]);

const TaskBar: React.FC = () => {
  const [startButtonClicked, setStartButtonClicked] =
    React.useState<boolean>(false);

  const handleStartButtonClick = () => {
    setStartButtonClicked((startButtonClicked) => !startButtonClicked);
  };

  const frameButton: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => console.log("공개방 클릭") },
    { children: "비공개방" },
  ];

  return (
    <Frame
      className="fixed bottom-0 left-0 w-screen bg-gray-500 p-2px flex items-center justify-between h-auto "
      w=""
      h=""
    >
      {/* Main */}
      <span className="flex flex-row justify-start shirink">
        {/* StartButton */}
        <Frame
          className="flex flex-row p-0.5 px-1 h-full m-1 items-center"
          onClick={handleStartButtonClick}
          boxShadow={startButtonClicked ? "in" : "out"}
        >
          <img src="/images/icon-image.png" className=" h-5"></img>
          <span className="pl-3 overflow-clip">Start</span>
        </Frame>
        {/* Page Status */}
        <Frame
          className="flex flex-row p-0.5 h-full m-1 items-center overflow-clip"
          boxShadow="in"
          bg="white"
        >
          <span className="px-7">Chat-Page</span>
        </Frame>

        {/* Current Tasks */}
        <div className="flex flex-row mx-1 overflow-clip">
          <Frame
            className="flex flex-row p-0.5 h-full m-0.5 items-center"
            boxShadow="out"
          >
            <span className="px-7">Current Tasks</span>
          </Frame>
          <Frame
            className="flex flex-row p-0.5 h-full m-0.5 items-center"
            boxShadow="out"
          >
            <span className="px-7">Current Tasks</span>
          </Frame>
        </div>
      </span>

      {/* Clock */}
      <Frame
        className="flex flex-row p-0.5 h-full m-1 items-center"
        onClick={handleStartButtonClick}
        boxShadow="in"
      >
        <span className="px-2">CLOCK</span>
      </Frame>
    </Frame>
  );
};

export default TaskBar;

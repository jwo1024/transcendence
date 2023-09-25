import React, { useState } from "react";
import { Frame } from "@react95/core";

const TaskButton = ({
  text,
  active,
  index,
  handleActiveTaskButton,
}: {
  text: string;
  active: boolean;
  index: number;
  handleActiveTaskButton: (key: number) => void;
}) => {
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);

  const handleStartButtonClick = () => {
    handleActiveTaskButton(active ? index : -1);
    setButtonClicked((buttonClicked) => !buttonClicked);
  };
  return (
    <Frame
      className="flex flex-row p-0.5 px-3 m-1 items-center justify-center text-md overflow-hidden whitespace-nowrap max-w-xs"
      onClick={handleStartButtonClick}
      boxShadow={active && buttonClicked ? "in" : "out"}
      h="100%"
    >
      {text}
    </Frame>
  );
};

export default TaskButton;

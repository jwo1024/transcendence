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
      className="flex flex-row p-0.5 h-full m-0.5 items-center"
      onClick={handleStartButtonClick}
      boxShadow={active && buttonClicked ? "in" : "out"}
    >
      <span className="px-7">{text}</span>
    </Frame>
  );
};

export default TaskButton;

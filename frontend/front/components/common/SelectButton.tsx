import React, { ReactNode } from "react";
import { Frame } from "@react95/core";

// FrameButton
interface FrameButtonProps {
  children?: ReactNode;
  boxShadow?: "in" | "";
  handleClick?: () => void;
  handleClickCustom?: () => void;
}

const FrameButton = ({
  children,
  boxShadow,
  handleClick,
  handleClickCustom,
  ...props
}: FrameButtonProps) => {
  const bindHandleClick = () => {
    if (handleClick) handleClick();
    if (handleClickCustom) handleClickCustom();
  };
  return (
    <Frame
      className="w-full h-full flex-1 p-1" // 모두 같은 비율의 with를 가지도록 수정하기
      boxShadow={boxShadow}
      onClick={bindHandleClick}
	  bg="#e6e6e6;" // TMP 누를때만 색상이 바뀌도록 수정하기
      {...props}
    >
      {children}
    </Frame>
  );
};


// SelectButton
interface SelectButtonProps {
  children?: ReactNode;
  frameButton?: FrameButtonProps[];
}

const SelectButton = ({
  children,
  frameButton,
  ...props
}: SelectButtonProps) => {
  const [activeFrameButtonKey, setActiveFrameButtonKey] =
    React.useState<number>(-1);

  const handleClick = (key: number) => () => {
    // console.log(key + "번째 버튼 클릭");
    // if (activeFrameButtonKey === key) setActiveFrameButtonKey(-1);
    // else
    setActiveFrameButtonKey(key);
  };

  return (
    <div className="flex flex-row w-full text-center" {...props}>
      {children}
      {frameButton?.map((button, index) => {
        return (
          <FrameButton
            key={index}
            boxShadow={activeFrameButtonKey === index ? "in" : ""}
            handleClick={handleClick(index)}
            handleClickCustom={button.handleClickCustom}
          >
            {button.children}
          </FrameButton>
        );
      })}
    </div>
  );
};

export default SelectButton;

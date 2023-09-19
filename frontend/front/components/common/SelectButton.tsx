import React, { ReactNode } from "react";
import { Frame } from "@react95/core";

// FrameButton
interface FrameButtonProps {
  children?: ReactNode;
  boxShadow?: "in" | "";
  bg?: string;
  handleClick?: () => void;
  handleClickCustom?: () => void;
}

const FrameButton = ({
  children,
  boxShadow,
  bg,
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
      className="w-full h-full flex-1 p-1"
      boxShadow={boxShadow}
      onClick={bindHandleClick}
      bg={bg}
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
  className?: string;
  defaultActiveKey?: number;
}

const SelectButton = ({
  children,
  frameButton,
  className,
  defaultActiveKey,
  ...props
}: SelectButtonProps) => {
  const [activeFrameButtonKey, setActiveFrameButtonKey] =
    React.useState<number>(defaultActiveKey || 0);

  const handleClick = (key: number) => () => {
    setActiveFrameButtonKey(key);
  };

  return (
    <div className={className?className:"flex flex-row w-full text-center"} {...props}>
      {children}
      {frameButton?.map((button, index) => {
        return (
          <FrameButton
            key={index}
            boxShadow={activeFrameButtonKey === index ? "in" : ""}
            bg={activeFrameButtonKey === index ? "#e6e6e6" : ""}
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
export type { FrameButtonProps };

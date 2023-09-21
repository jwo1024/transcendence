import { Frame, TitleBar } from "@react95/core";
import React, { ReactNode, useState, useContext, useEffect } from "react";
import { TaskListContext } from "@/context/PageContext";

interface WindowProps {
  children?: ReactNode;
  title: string;
  w?: string;
  h?: string;
  customOption?: JSX.Element;
  className?: string;
  // active?: boolean;
  xOption?: boolean;
  minimizeOption?: boolean;
  customOnClickXOption?: () => void;
}

const Window = ({
  children,
  title,
  w,
  h,
  customOption,
  className,
  // active = true,
  xOption = true,
  minimizeOption = false,
  customOnClickXOption,
  ...props
}: WindowProps) => {
  const { dispatchTaskList } = useContext(TaskListContext);
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    dispatchTaskList({
      type: "ADD",
      task: { title: title, active: active },
    });
    return () => {
      dispatchTaskList({
        type: "REMOVE",
        title: title,
      });
    };
  }, []);

  const onClickXOption = () => {
    if (customOnClickXOption) {
      console.log("CHECK : Window : onClickXOption");
      customOnClickXOption();
    }
  };

  const onClickMinimizeOption = () => {
    dispatchTaskList({
      type: "MINIMIZE",
      title: title,
    });
    setActive(false);
  };

  return (
    <>
      {active ? (
        <Frame
          {...props}
          className={
            className
              ? "flex flex-col w-full h-full p-0.5 m-1 shrink min-h-100 min-w-100" +
                className
              : "flex flex-col w-full h-full p-0.5 m-1 shrink min-h-100 min-w-100"
          }
          title={title}
          w={w ? w : ""}
          h={h ? h : ""}
        >
          <TitleBar
            className=""
            active={true}
            title={title}
            // icon={<FileIcons variant="32x32_4" />}
          >
            <TitleBar.OptionsBox>
              {customOption}
              {minimizeOption ? (
                <TitleBar.Option onClick={onClickMinimizeOption}>
                  ㅡ
                </TitleBar.Option>
              ) : null}
              {xOption ? (
                <TitleBar.Option onClick={onClickXOption}>X</TitleBar.Option>
              ) : null}
            </TitleBar.OptionsBox>
          </TitleBar>
          <div className="flex flex-col flex-1 overflow-auto">{children}</div>
        </Frame>
      ) : null}
    </>
  );
};

export default Window;

import { Frame, TitleBar } from "@react95/core";
import React, { FC, ReactNode } from "react";

import { Access218, FileIcons, Raplayer801 } from "@react95/icons";

interface WindowProps {
  children?: ReactNode;
  title: string;
  w?: string;
  h?: string;
  customOption?: JSX.Element;
}

const Window = ({ children, title, w, h, customOption, ...props }: WindowProps) => {
  return (
    <Frame {...props} className="flex flex-col w-full h-full p-0.5" title={title} w={w?w:""} h={h?h:""}>
      <TitleBar
        className=""
        active={true}
        title={title}
        icon={<FileIcons variant="32x32_4" />}
      >
        <TitleBar.OptionsBox >
          {customOption}
          <TitleBar.Option>X</TitleBar.Option>
        </TitleBar.OptionsBox>
      </TitleBar>
      <div className="flex flex-col flex-1 overflow-auto">
        {children}
      </div>
    </Frame>
  );
};

export default Window;

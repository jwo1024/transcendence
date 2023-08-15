import { Frame, TitleBar } from "@react95/core";
import React, { FC, ReactNode } from "react";

import { Access218, FileIcons, Raplayer801 } from "@react95/icons";

interface WindowProps {
  children: ReactNode;
  title: string;
  w?: number;
  h?: number;
  customOption?: JSX.Element;
}

const Window = ({ children, title, w, h, customOption, ...props }: WindowProps) => {
  return (
    <Frame {...props} className="window w-full h-full" title={title} w={w?w:""} h={h?h:""}>
      <TitleBar
        className="h-1/6"
        active={true}
        title={title}
        icon={<FileIcons variant="32x32_4" />}
      >
        <TitleBar.OptionsBox>
          {customOption}
          <TitleBar.Option>X</TitleBar.Option>
        </TitleBar.OptionsBox>
      </TitleBar>
      <div className="h-5/6 p-1">
        {children}
      </div>
    </Frame>
  );
};

export default Window;

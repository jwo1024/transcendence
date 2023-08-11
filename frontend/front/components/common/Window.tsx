import { Frame, TitleBar } from "@react95/core";
import React, { FC, ReactNode } from "react";

import { Access218, FileIcons, Raplayer801} from "@react95/icons";

import { Bookmark } from "@react95/icons/esm/react/Bookmark";

interface WindowProps {
  children: ReactNode;
  title: string;
  w?: number;
  h?: number;
}

const Window = ({ children, title, w, h, ...props }: WindowProps) => {
  return (
    <Frame {...props} className="window w-full" title={title} w={w} h={h}>
        <TitleBar active={true} title={title} icon={<FileIcons variant="32x32_4" />}>
			<TitleBar.OptionsBox>
				<TitleBar.Option>?</TitleBar.Option>
				<TitleBar.Option>X</TitleBar.Option>
			</TitleBar.OptionsBox>
		</TitleBar>
      <div className="">
	  {children}
	  </div>
    </Frame>
  );
};

export default Window;

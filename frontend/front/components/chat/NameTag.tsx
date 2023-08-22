import React, { FC, ReactNode } from "react";
import { Tooltip, List } from "@react95/core";


interface NameTagProps {
  name?: string;
  children?: ReactNode;

  //   key: number;
}

const NameTag: FC<NameTagProps> = ({ name, children }: NameTagProps) => {
  return (
    <Tooltip text="user | admin">
      <span className="text-center text-white font-semibold mx-2 px-3 py-1 bg-stone-600 rounded">
        {name ? name : children}
      </span>
    </Tooltip>
  );
};

export default NameTag;

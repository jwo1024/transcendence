import React, { FC, ReactNode } from "react";

interface NameTagProps {
  name?: string;
  children?: ReactNode;
}

const NameTag: FC<NameTagProps> = ({ name, children }: NameTagProps) => {
  return (
    <span className="text-center text-white font-semibold mx-2 px-3 py-1 bg-stone-600 rounded">
      {name ? name : children}
    </span>
  );
};

export default NameTag;

import React, { ReactNode } from "react";

interface MenuBoxLayoutProps {
  children?: ReactNode;
}

const MenuBoxLayout = ({ children }: MenuBoxLayoutProps) => {
  return <div className="flex flex-col w-2/5 p-3 overflow-auto">{children}</div>;
};

export default MenuBoxLayout;

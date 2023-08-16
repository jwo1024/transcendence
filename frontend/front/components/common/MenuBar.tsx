import React, { useState } from "react";
import { List, Modal } from "@react95/core";

interface ListProps {
  name: string;
  handleClick: () => void;
}

interface MenuBarProps {
  menu?: ListProps[];
}

const MenuBar = ({ menu }: MenuBarProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <ul className="flex flex-row">
        {menu?.map((menu, index) => {
          return (
            <li
              key={index}
              className="text-center px-2 hover:text-white focus:text-white"
              onClick={menu.handleClick}
            >
              {menu.name}
            </li>
          );
        })}
      </ul>
      <List.Divider />
    </>
  );
};

export default MenuBar;

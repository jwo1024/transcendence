import React, { useState } from "react";
import { List, Modal } from "@react95/core";
import { Computer } from "@react95/icons";

const MenuBar = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
    setShowModal((showModal) => !showModal);
    // focus
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleButtonClick = () => {
    //  setShowModal(false);
  };

  return (
    <>
      <ul className="flex flex-row">
        <li
          className="text-center px-2 hover:text-white focus:text-white"
          onClick={handleClick}
        >
          Settings
        </li>
        <li className="text-center px-2 hover:text-white focus:text-white">
          User-List
        </li>
      </ul>
      <List.Divider />
    </>
  );
};

export default MenuBar;

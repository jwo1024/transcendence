import React, { useState } from "react";
import { List, Modal } from "@react95/core";
import { Computer } from "@react95/icons";

const MenuBar = () => {

  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
    setShowModal(showModal => !showModal);
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
      <ul className="flex flex-row text-center">
        <li className="text-center px-2 hover:text-white focus:text-white ease-in-out transition-all" onClick={handleClick}>
          hi1
        </li>
        <li className="text-center px-2 hover:text-white focus:text-white ease-in-out transition-all">hi2</li>
      </ul>
      {showModal && (
         <Modal className="modal fixed  top-1/4 left-1/4 p-6 bg-white shadow-md" width="300" height="200" icon={<Computer variant="32x32_4" />} title="Browse" defaultPosition={{
           x: 0,
           y: 20
         }} closeModal={handleCloseModal} buttons={[{
           value: 'Ok',
           onClick: handleButtonClick
         }, {
           value: 'Cancel',
           onClick: handleButtonClick
         }]} menu={[{
           name: 'File',
           list: <List>
                       <List.Item onClick={handleCloseModal}>Exit</List.Item>
                     </List>
         }, {
           name: 'Edit',
           list: <List>
                       <List.Item>Copy</List.Item>
                     </List>
         }]} > <div>a ju nice</div> </Modal>
      )}
      <List.Divider />
    </>
  );
};

export default MenuBar;

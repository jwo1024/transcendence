import React, { ReactNode } from "react";

import { Fieldset, Frame, Button, Checkbox, List } from "@react95/core";

import NameTag from "./NameTag";

const ChatUserListBox = ({ children }: { children?: ReactNode }) => {
  const userList = [
    { name: "user1", role: "admin" },
    { name: "user2", role: "user" },
    { name: "user3", role: "user" },
    { name: "user4", role: "user" },
  ];

  return (
    <div className="flex flex-col w-2/5 p-3">
      {/* user list */}
      <Fieldset className="flex flex-col p-2 w-full h-min" legend="User List">
        <Frame
          className=" text-white p-3 overflow-y-scroll bg-zinc-800"
          h="300"
          w="100%"
          boxShadow="in"
          bg=""
        >
          {userList.map((user, index) => {
            return (
              <div className="m-1 my-4 text-lg">
                <Checkbox className="" key={index}></Checkbox>
                {/* name tag 스타일 가능하도록 수정하기 */}
                <NameTag>{user.name}</NameTag>
                <NameTag>{user.role}</NameTag>
              </div>
            );
          })}
        </Frame>
      </Fieldset>
      <br />
      {/* buttons */}
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Button className="flex-1">kick</Button>
          <Button className="flex-1">ban</Button>
          <Button className="flex-1">mute</Button>
        </div>
        <div className="flex flex-col">
          <Button>invite-freind</Button>
          <Button>leave-chat</Button>
        </div>
      </div>
      {/* TMP */}
      <div className="flex flex-col p-5">{children}</div>
    </div>
  );
};

export default ChatUserListBox;

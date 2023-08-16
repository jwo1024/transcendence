import React, { ReactNode } from "react";

import { Fieldset, Frame, Button } from "@react95/core";

const ChatUserListBox = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col w-2/5 p-3">
      <Fieldset className="flex flex-col p-2 w-full h-min" legend="User List">
        <Frame
          className=" text-white p-3 overflow-y-scroll"
          h="300"
          w="100%"
          boxShadow="in"
          bg="black"
        >
          <div>user1 : 관리자 </div>
          <div>user2 : 일반</div>
        </Frame>
      </Fieldset>
      <br />
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
	  <div className="flex flex-col p-5"> 
		{children}
	  </div>
    </div>
  );
};

export default ChatUserListBox;

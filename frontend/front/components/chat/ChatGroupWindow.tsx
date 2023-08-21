import { ChangeEvent, useCallback, useState } from "react";
import { useRef, useEffect } from "react";
import { Button, Input } from "@react95/core";

import MessageBox from "./MessageBox";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import ChatSettingBox from "./ChatSettingBox";
import ChatUserListBox from "./ChatUserListBox";

function ChatGroupWindow() {
  const [message, setMessage] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSettingBox, setShowSettingBox] = useState<boolean>(true);

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  const handleSendMessage = useCallback(() => {
    setMessage([...message, inputRef.current?.value as string]);
    resetInputMessage();
  }, [message]);

  const handleFormSubmit = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSendMessage();
    },
    [handleSendMessage]
  );

  const handleTmpButton = () => {
    setShowSettingBox((showSettingBox) => !showSettingBox);
  };

  const menuItems = [
    { name: "Settings", handleClick: handleTmpButton },
    { name: "User-List", handleClick: handleTmpButton },
  ];

  useEffect(() => console.log("렌더링된다"));

  return (
    <Window title="Chatting Room | 방제">
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box => DM 에서도 쓸 거니가 Component화 하면 좋겠따*/}
        <div className="flex flex-col flex-1 overflow-auto ">
          <div className="flex flex-row flex-1 overflow-auto">
            {/* 메시지 데이터 관리방법 어떻게 하지? :  user-name, text, 날짜시간 */}
            <MessageBox message={message} />
          </div>
          <form onSubmit={handleFormSubmit} className="flex flex-row">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              // onChange={handleInputChange}
              ref={inputRef}
            />
            <Button>send</Button>
          </form>
        </div>
        {showSettingBox ? <ChatSettingBox /> : <ChatUserListBox />}
      </div>
    </Window>
  );
}

export default ChatGroupWindow;

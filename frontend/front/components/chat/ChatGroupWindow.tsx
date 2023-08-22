import { ChangeEvent, useCallback, useState } from "react";
import { useRef, useEffect } from "react";
import { Button, Frame, Input } from "@react95/core";

import MessageBox from "./MessageBox";
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import ChatSettingBox from "./ChatSettingBox";
import ChatUserListBox from "./ChatUserListBox";

function ChatGroupWindow({ className }: { className?: string }) {
  const [message, setMessage] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSettingBox, setShowSettingBox] = useState<boolean>(false);
  const [showUserListBox, setshowUserListBox] = useState<boolean>(false);

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

  const handleSettingBoxButton = () => {
    setShowSettingBox((showSettingBox) => !showSettingBox);
    if (showUserListBox) {
      setshowUserListBox(false);
    }
  };

  const handleUserListBoxButton = () => {
    setshowUserListBox((showUserListBox) => !showUserListBox);
    if (showSettingBox) {
      setShowSettingBox(false);
    }
  };

  const menuItems = [
    { name: "Settings", handleClick: handleSettingBoxButton },
    { name: "User-List", handleClick: handleUserListBoxButton },
  ];

  useEffect(() => console.log("렌더링된다"));

  return (
    <Window title="Chatting Room | 방제" className={className}>
      {/* menu bar */}
      <MenuBar menu={menuItems} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto ">
        {/* chat box => DM 에서도 쓸 거니가 Component화 하면 좋겠따*/}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-row flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            {/* 메시지 데이터 관리방법 어떻게 하지? :  user-name, text, 날짜시간 */}
            <MessageBox message={message} />
          </Frame>
          <form onSubmit={handleFormSubmit} className="flex flex-row p-1">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              // onChange={handleInputChange}
              ref={inputRef}
            />
            <Button>send</Button>
          </form>
        </div>

        {showSettingBox ? <ChatSettingBox /> : null}
        {showUserListBox ? <ChatUserListBox /> : null}
      </div>
    </Window>
  );
}

export default ChatGroupWindow;

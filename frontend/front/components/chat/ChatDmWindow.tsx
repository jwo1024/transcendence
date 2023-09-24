// Libraries
import { useState, useEffect } from "react";
import { Button, Frame, Input } from "@react95/core";
// Components
import Window from "../common/Window";
import MenuBar from "../common/MenuBar";
import MessageBox from "./chat_window/MessageBox";
import SettingMenuBox from "./chat_window/SettingMenu";
import StatusBlock from "./chat_window/StatusBlock";
// Types & Hooks & Contexts
import {
  RecvMessageDTO,
  SimpUserI,
  SimpRoomI,
  SendMessageDTO,
} from "@/types/ChatInfoType";
import useMessageForm from "@/hooks/chat/useMessageForm";
import useMenuBox from "@/hooks/useMenuBox";
import type { MenuItemInfo } from "@/hooks/useMenuBox";

interface ChatDMWindowProps {
  className?: string;
  userInfo: SimpUserI;
  roomInfo: SimpRoomI;
  customOnClickXOption?: () => void;
}

const ChatDMWindow = ({
  className,
  userInfo,
  roomInfo,
  customOnClickXOption,
}: ChatDMWindowProps) => {
  const [messageList, setMessageList] = useState<RecvMessageDTO[]>([]);
  const { inputRef, sentMessageList, deleteSentMessage, handleFormSubmit } =
    useMessageForm({
      roomInfo,
      userInfo,
    });
  const friendName = "<Loading...>"; /// tmp data

  useEffect(() => {
    // getMessageFrom Server .. socket io
    // console.log("ChatDMWindow.tsx : useEffect : getMessageFrom Server");
    return () => {};
  }, []);

  useEffect(() => {
    if (sentMessageList.length !== 0) return;
    // socket?.emit("Message-add", sentMessageList[0]);
  }, [sentMessageList]);

  const makeMessage = (sentMessage: SendMessageDTO) => {
    const message: RecvMessageDTO = {
      text: sentMessage.text,
      room: roomInfo,
      user: userInfo,
      created_at: new Date(),
    };
    return message;
  };

  // Menu Items
  const menuItems: MenuItemInfo[] = [{ name: "Settings" }];
  const { menuItemsWithHandlers, showMenuBox } = useMenuBox(menuItems);

  return (
    <Window
      title={`DM Room / ${friendName}`}
      className={className}
      customOnClickXOption={customOnClickXOption}
    >
      {/* menu bar */}
      <MenuBar menu={menuItemsWithHandlers} />
      {/* main box */}
      <div className="flex flex-row flex-1 overflow-auto">
        {/* chat box */}
        <div className="flex flex-col flex-1 overflow-auto ">
          <Frame
            className="flex flex-col flex-1 overflow-auto p-1"
            boxShadow="in"
          >
            <Frame className="p-3" boxShadow="in" bg="white">
              <StatusBlock>{`${friendName}과의 DM 방`}</StatusBlock>
            </Frame>
            <MessageBox
              messageList={messageList}
              sentMessageList={sentMessageList}
              userInfo={userInfo}
            />
          </Frame>
          <form onSubmit={handleFormSubmit} className="flex flex-row p-1">
            <Input
              className="w-full h-full "
              placeholder="Hello, my friend !"
              ref={inputRef}
            />
            <Button>send</Button>
          </form>
        </div>
        {/* menu box */}
        {showMenuBox[0] ? <SettingMenuBox roomInfo={roomInfo} /> : null}
      </div>
    </Window>
  );
};

export default ChatDMWindow;

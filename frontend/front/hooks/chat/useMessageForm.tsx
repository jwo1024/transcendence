import { ChangeEvent, useState, useRef, useEffect, useMemo } from "react";

import { MessageInfo, ChatRoomInfo, UserInfo } from "@/types/ChatInfoType";

const useMessageForm = ({
  chatRoomData,
  // userInfo,
}: {
  chatRoomData: ChatRoomInfo;
  // userInfo: UserInfo;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: -1,
    name: "test",
  });
  const [sentMessage, setSentMessage] = useState<MessageInfo>({
    chatRoomId: -1,
    user: userInfo,
    message: "",
    createdAt: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    const obj = JSON.parse(user || "{}");
    if (obj) setUserInfo({
      id: obj.id,
      name: obj.nickname,
    });
    console.log("CHECK : useMessageForm : MOUNT");
    return () => {
      console.log("CHECK : useMessageForm : UNMOUNT");
    }
  }, []);

  const resetInputMessage = () => {
    inputRef.current!.value = "";
  };

  console.log("CHECK : useMessageForm : RENDER");

  // send message to server
  const handleSendMessage = () => {
    // console.log("useMessageForm.tsx : user : ", userInfo);
    // make message data
    if (userInfo.id === -1 || chatRoomData.id === -1) return;
    const messageData: MessageInfo = {
      chatRoomId: chatRoomData?.id || -1, // get from local storage? or chatRoomData
      user: userInfo,
      message: inputRef.current?.value || "",
      createdAt: "00:00:00", // toss to server
    };
    // have to send this data to server
    // socket io .. something something
    // console.log(messageData);
    setSentMessage(messageData);
    resetInputMessage();
  };

  const handleFormSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  };

  return {
    inputRef,
    sentMessage,
    handleSendMessage,
    handleFormSubmit,
  };
};

export default useMessageForm;

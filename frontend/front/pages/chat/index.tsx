// Libaraies
import { useEffect, useState, useContext } from "react";
// Components
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";
// Types & Hooks & Contexts
import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import { CurrentPageContext } from "@/context/PageContext";
import ChatSocketContext from "@/context/ChatSocketContext";
import { HandleChatOpenWindowContext } from "@/context/ChatOpenWindowContext";
import { SimpUserI } from "@/types/ChatInfoType";

const ChatPage = () => {
  const { setCurrentPage } = useContext(CurrentPageContext);
  const openWindow = useChatRoomListReducer();
  const addOpenWindow = openWindow.addState;
  const removeOpenWindow = openWindow.removeState;
  const setListOpenWindow = openWindow.setListState;
  //
  const [userInfo, setUserInfo] = useState<SimpUserI | null>(null);

  useEffect(() => {
    setCurrentPage("Chat-Page");
    window.addEventListener("resize", handleResize);
    getUserInfo();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Screen resize
  const [felxRow, setFelxRow] = useState<boolean>(true);
  const handleResize = () => {
    setFelxRow(window.innerWidth > window.innerHeight);
  };

  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.id === undefined || user.nickname === undefined) return;
    setUserInfo({
      id: user.id,
      nickname: user.nickname,
    });
  };

  const routeErrorPage = () => {
    // TODO
  };

  return (
    <div className="m-2 max-w-screen ">
      {userInfo === null ? (
        <div className=" text-2xl text-center pt-60">Loading...</div>
      ) : (
        <div
          className={felxRow ? "flex flex-row h-90vh" : "flex flex-col h-90vh"}
        >
          <ChatSocketContext>
            {/* Waiting Room */}
            <HandleChatOpenWindowContext.Provider
              value={{ addOpenWindow, removeOpenWindow, setListOpenWindow }}
            >
              <WaitingRoomWindow userInfo={userInfo} />
              {/* <HandleChat... */}
            </HandleChatOpenWindowContext.Provider>

            {/* Chat Rooms */}
            {openWindow.state?.map((roomData) => (
              <div
                key={roomData.roomId}
                className="flex flex-col w-full h-full p-0.5 m-1 shrink min-h-100 min-w-100"
              >
                {roomData.roomType === "dm" ? (
                  <ChatDmWindow
                    userInfo={userInfo}
                    roomInfo={roomData}
                    key={roomData.roomId}
                    customOnClickXOption={() =>
                      removeOpenWindow({ roomId: roomData.roomId })
                    }
                  />
                ) : (
                  <ChatGroupWindow
                    userInfo={userInfo}
                    roomInfo={roomData}
                    key={roomData.roomId}
                    customOnClickXOption={() =>
                      removeOpenWindow({ roomId: roomData.roomId })
                    }
                  />
                )}
              </div>
            ))}
          </ChatSocketContext>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

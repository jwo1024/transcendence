// Libaraies
import { useEffect, useState, useContext } from "react";
// Components
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";
// Types & Hooks & Contexts
import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import ChatSocketContext from "@/context/ChatSocketContext";
import { HandleChatOpenWindowContext } from "@/context/ChatOpenWindowContext";
import { SimpUserI } from "@/types/ChatInfoType";

const ChatPage = () => {
  const openWindow = useChatRoomListReducer();
  const addOpenWindow = openWindow.addState;
  const removeOpenWindow = openWindow.removeState;
  const setListOpenWindow = openWindow.setListState;
  //
  const [userInfo, setUserInfo] = useState<SimpUserI | null>(null);

  useEffect(() => {
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
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
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
    <div className="m-2 max-w-screen">
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
            {openWindow.state?.map((simpRoomData) => (
              <div
                key={simpRoomData.roomId}
                className="flex flex-col w-full h-full p-0.5 m-1 shrink min-h-100 min-w-100"
              >
                {simpRoomData.roomType === "dm" ? (
                  <ChatDmWindow
                    userInfo={userInfo}
                    simpRoomInfo={simpRoomData}
                    key={simpRoomData.roomId}
                    customOnClickXOption={() =>
                      removeOpenWindow({ roomId: simpRoomData.roomId })
                    }
                  />
                ) : (
                  <ChatGroupWindow
                    userInfo={userInfo}
                    simpRoomInfo={simpRoomData}
                    key={simpRoomData.roomId}
                    customOnClickXOption={() =>
                      removeOpenWindow({ roomId: simpRoomData.roomId })
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

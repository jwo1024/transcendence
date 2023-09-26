// Libaraies
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
// Components
import WaitingRoomWindow from "@/components/chat/WaitingRoomWindow";
import ChatGroupWindow from "@/components/chat/ChatGroupWindow";
import ChatDmWindow from "@/components/chat/ChatDmWindow";
// Types & Hooks & Contexts
import useChatRoomListReducer from "@/hooks/chat/useChatRoomListReducer";
import ChatSocketContext from "@/context/ChatSocketContext";
import { HandleChatOpenWindowContext } from "@/context/ChatOpenWindowContext";
import { SimpRoomI, SimpUserI } from "@/types/ChatInfoType";
import { SocketContext } from "@/context/ChatSocketContext";
import {
  ON_INVITE_TO_CHAT,
  ON_MY_BLOCK_LIST,
  ON_GOT_INVITED_TO_GAME,
  EMIT_REFUSE_GAME_INVITE,
} from "@/types/ChatSocketEventName";

const ChatPage = () => {
  const openWindow = useChatRoomListReducer();
  const addOpenWindow = openWindow.addState;
  const removeOpenWindow = openWindow.removeState;
  const setListOpenWindow = openWindow.setListState;
  const [userInfo, setUserInfo] = useState<SimpUserI | null>(null);
  const [blockIdList, setBlockIdList] = useState<number[]>([]);

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
            <ListenSocketBlock
              blockIdList={blockIdList}
              setBlockIdList={setBlockIdList}
              addOpenWindow={addOpenWindow}
            >
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
                      blockIdList={blockIdList}
                      customOnClickXOption={() =>
                        removeOpenWindow({ roomId: simpRoomData.roomId })
                      }
                    />
                  ) : (
                    <ChatGroupWindow
                      userInfo={userInfo}
                      simpRoomInfo={simpRoomData}
                      key={simpRoomData.roomId}
                      blockIdList={blockIdList}
                      customOnClickXOption={() =>
                        removeOpenWindow({ roomId: simpRoomData.roomId })
                      }
                    />
                  )}
                </div>
              ))}
            </ListenSocketBlock>
          </ChatSocketContext>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

// utils ListenBlockList
interface ListenSocketBlockProps {
  blockIdList: number[];
  setBlockIdList: React.Dispatch<React.SetStateAction<number[]>>;
  addOpenWindow: (roomData: { roomData: SimpRoomI }) => void;
  children: React.ReactNode;
}
const ListenSocketBlock = ({
  setBlockIdList,
  addOpenWindow,
  children,
}: ListenSocketBlockProps) => {
  const socket = useContext(SocketContext);
  const router = useRouter();

  useEffect(() => {
    // 초기 blockList 업데이트
    // 채팅방 초대
    // 게임 초대
    socket?.on(ON_MY_BLOCK_LIST, (data) => {
      console.log("socket.on ON_MY_BLOCK_LIST", data);
      const blockList: number[] = data;
      setBlockIdList(blockList);
    });
    socket?.on(ON_INVITE_TO_CHAT, (data) => {
      console.log("socket.on ON_INVITE_TO_CHAT", data);
      const roomData: SimpRoomI = data;
      alert(`채팅방에 초대되셨습니다!`);
      addOpenWindow({ roomData: roomData });
    });
    socket?.on(ON_GOT_INVITED_TO_GAME, (data) => {
      console.log("socket.on ON_GOT_INVITED_TO_GAME", data);
      const user: SimpUserI = data;
      if (
        !confirm(
          `[${user.nickname}]으로부터 게임에 초대되셨습니다! 게임을 열까요?`
        )
      )
        socket.emit(EMIT_REFUSE_GAME_INVITE, { hostId: user.id });
      else router.push("/game/friendly");
    });
    return () => {
      socket?.off(ON_MY_BLOCK_LIST);
      socket?.off(ON_INVITE_TO_CHAT);
    };
  }, []);

  return <>{children}</>;
};

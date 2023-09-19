import React, { createContext, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import Router from "next/router";

const socketUrl: string =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:4000/chat";

export const SocketContext = createContext<Socket | undefined>(undefined);
// const socket = io(socketUrl);

const ChatSocketContext = (props: React.PropsWithChildren<{}>) => {
  // const socket = io(socketUrl);
  let socket: Socket | null = null;
  const router = Router;
  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // tmp
    socket = io(socketUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!socket) {
      router.push(`${errorPage}?error=socket_problem`);
      return;
    }

    socket.on("connect", () => {
      console.log("Socket connected");
    });
    // Socket 연결 실패 시
    socket.on("disconnect", (error) => {
      console.error("Socket connection failed:", error);
      // router.push(`${errorPage}?error=socket_disconnect`);
    });

    socket.onAny((event, ...args) => {
      // event 의 이벤트 이름을 알고싶어
      console.log("Socket onAny:", event, args);
    });

    console.log("SocketContext : Mount");
    // onDm 알림 추가
    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.offAny();
      socket?.removeAllListeners();
      socket?.removeListener();
      socket?.disconnect();
      socket?.disconnect();
      console.log("SocketContext : Unmount");
    };
  }, []);

  return (
    <>
      {socket ? (
        <SocketContext.Provider value={socket}>
          {props.children}
        </SocketContext.Provider>
      ) : (
        <>{props.children}</>
      )}
    </>
  );
};

export default ChatSocketContext;

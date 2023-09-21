import React, { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Router from "next/router";
const socketUrl: string =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:4000/chat";
export const SocketContext = createContext<Socket | undefined>(undefined);
const ChatSocketContext = (props: React.PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = Router;
  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // tmp
    setSocket(
      io(socketUrl, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    return () => {
      if (socket) socket.close();
      setSocket(null);
      console.log("SocketContext : Unmount");
    };
  }, []);
  useEffect(() => {
    if (!socket) {
      // router.push(`${errorPage}?error=socket_problem`);
      return;
    }
    socket.on("connect", () => {
      console.log("Socket connected");
    });
    // Socket 연결 실패 시
    socket.on("disconnect", (error) => {
      console.error("Socket connection failed:", error);
    });
    // socket.on("Response-Room-create", (data) => {
    //   console.log("Response-Room-Create", data);
    // });
    socket.onAny((event, ...args) => {
      console.log("Socket onAny:", event, args);
    });
    console.log("socket : Mount");
    // onDm 알림 추가
    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.offAny();
      socket?.disconnect();
      socket?.close();
      console.log("SocketContext: Unmount");
    };
  }, [socket]);
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

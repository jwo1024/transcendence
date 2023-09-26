import React, { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Router from "next/router";
import {
  ON_ERROR,
  ON_CONNECT,
  ON_DISCONNECT,
} from "@/types/ChatSocketEventName";

const socketUrl: string =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ||
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`;
export const SocketContext = createContext<Socket | undefined>(undefined);

const ChatSocketContext = (props: React.PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = Router;
  const errorPage = process.env.NEXT_PUBLIC_ERROR_PAGE_SIGNUP;
  const frontUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // tmp
    setSocket(
      io(socketUrl, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    console.log("SocketContext : Mount");
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
    socket.on(ON_CONNECT, () => {
      console.log("Socket connected");
    });
    // Socket 연결 실패 시
    socket.on(ON_DISCONNECT, (error) => {
      console.error("Socket connection failed:", error);
      socket.connect();
    });

    socket.on(ON_ERROR, (error) => {
      console.error("Socket error:", error);
      router.push(`${frontUrl}/menu`);
    });

    // socket.onAny((event, ...args) => {
    //   console.log("SocketContext : onAny", event, args);
    // });

    return () => {
      socket?.off(ON_CONNECT);
      socket?.off(ON_DISCONNECT);
      socket?.offAny();
      socket?.disconnect();
      socket?.close();
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

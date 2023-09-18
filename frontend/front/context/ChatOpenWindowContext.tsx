import { createContext, ReactNode } from "react";
import { SimpRoomI } from "@/types/ChatInfoType";

export interface HandleChatOpenWindowContextI {
  addOpenWindow: ({ roomData }: { roomData: SimpRoomI }) => void;
  removeOpenWindow: ({ roomId }: { roomId: number }) => void;
  setListOpenWindow: ({ roomList }: { roomList: SimpRoomI[] }) => void;
}

export const HandleChatOpenWindowContext =
  createContext<HandleChatOpenWindowContextI | null>(null);
// export const ChatOpenWindowContext = createContext<ReactNode[] | null>(null);

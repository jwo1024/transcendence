import { UserI } from "./user.interface";
import { RoomI } from "./room.interface";

export interface JoinedRoomI {
  id?: number;
  socketId: string;
  user: UserI;
  room: RoomI;
}

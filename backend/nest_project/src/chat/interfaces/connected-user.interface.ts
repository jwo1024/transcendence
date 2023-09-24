import { UserI } from "./user.interface"; 
import { RoomEntity } from "../entities/room.entity";

export interface ConnectedUserI {
  id: number;
  socketId: string;
  user: UserI;
  room : RoomEntity;
}
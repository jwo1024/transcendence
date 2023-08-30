import { UserI } from "./user.interface";
import { roomType } from "../types/roomTypes";

export interface RoomI {
  roomId?: number;
  roomName?: string;
  roomType: roomType;
  isPublic: boolean;
  roomPass?: string;
  roomOwner: number; //owner user의 id
  roomAdmins: Map<number, void>; //ids
  roomBanned: Map<number, void>; //ids
  users?: Map<number, UserI>;
//   description?: string;
//   created_at?: Date;
//   updated_at?: Date;
}
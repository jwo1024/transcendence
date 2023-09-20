// import { UserI } from "./user.interface";
import { roomType } from "../types/roomTypes";
import { JoinedRoomEntity } from "../entities/joined-room.entity";
import { MessageEntity } from "../entities/message.entity";
import { UserEntity } from "../entities/user.entity";

export interface RoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  roomPass: string;
  roomOwner: number; //owner user의 id
  roomAdmins: number[]; //ids
  roomBanned: number[]; //ids
  users: UserEntity[];
  joinedUsers: JoinedRoomEntity[];
  messages: MessageEntity[];
  created_at?: Date;
  // updated_at?: Date;
}
// import { UserI } from "./user.interface";
import { roomType } from "../types/roomTypes";
import { JoinedRoomEntity } from "../entities/joined-room.entity";
import { MessageEntity } from "../entities/message.entity";
import { UserEntity } from "../entities/user.entity";

export interface RoomI {
  roomId?: number;
  roomName?: string;
  roomType: roomType;
  isPublic: boolean;
  roomPass?: string;
  roomOwner: number; //owner user의 id
  roomAdmins: Map<number, void>; //ids
  roomBanned: Map<number, void>; //ids
  users?: UserEntity[];
  joinedUsers?: JoinedRoomEntity[];
  messages?: MessageEntity[];

}
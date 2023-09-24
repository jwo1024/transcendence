import { roomType } from "../types/roomTypes";
import { SimpleUserDto } from "./simpleUser.dto";

export class RoomCreateDTO {

  roomName: string;

  roomType: roomType;

  roomPass?: string;

}

export class RoomJoinDTO 
{

  roomId: number;

  roomPass?: string;

}

export class RoomInviteDTO 
{

  targetUserNickname: string;

  roomId: number;

}

export class RoomleaveDTO
{
  roomId: number;
}

export class AdminRelatedDTO 
{
  targetUserId: number;

  roomId: number;
}

export class SimpleRoomDTO {
  roomId: number;
  roomName: string;
  roomType: roomType;
  hasPass: boolean;
  joinUsersNum: number; 
}

export class SpecificRoomDTO {
  roomId: number;
  roomName: string;
  roomType: roomType;
  hasPass : boolean;
  roomOwner: number; //owner user의 id
  roomAdmins: number[]; //ids
  roomBanned: number[]; //idsx
  users: SimpleUserDto[];
  created_at?: Date;
}
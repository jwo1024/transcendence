import { roomType } from "../types/roomTypes";
import { SimpleUserDto } from "./simpleUser.dto";

//jchoi
export class RoomCreateDTO {

  roomName: string; //not null  100자 이내

  roomType: roomType; //not null  'dm' 'open' 'private' 중 하나

  roomPass?: string; // 15자 이내

}

export class RoomJoinDTO 
{

  roomId: number; //not null not undefined

  roomPass?: string; 

}

export class RoomInviteDTO 
{

  targetUserNickname: string; //not null not undefined

  roomId: number;  //not null not undefined

}

export class RoomleaveDTO
{
  roomId: number;  //not null not undefined
}

export class AdminRelatedDTO 
{
  targetUserId: number;  //not null not undefined

  roomId: number;  //not null not undefined
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
import { roomType } from "../types/roomTypes";
import { SimpleUserDto } from "./simpleUser.dto";
import { IsString, IsNotEmpty } from "class-validator";

export class RoomCreateDTO {

  @IsString()
  @IsNotEmpty()
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
  roomOwner: number; 
  roomAdmins: number[];
  roomBanned: number[];
  users: SimpleUserDto[];
  created_at?: Date;
}